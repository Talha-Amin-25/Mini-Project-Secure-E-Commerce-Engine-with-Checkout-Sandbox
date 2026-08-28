require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- STRIPE WEBHOOK ---
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.order_id;
        try {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                db.run("UPDATE orders SET status = 'completed' WHERE id = ?", [orderId], function(err) { if (err) throw err; });
                db.all("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId], (err, items) => {
                    if (err) { db.run("ROLLBACK"); return; }
                    let errorOccurred = false;
                    for (const item of items) {
                        db.run("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", [item.quantity, item.product_id], (err) => { if (err) errorOccurred = true; });
                    }
                    if (errorOccurred) db.run("ROLLBACK"); else db.run("COMMIT");
                });
            });
        } catch (error) { console.error('Error processing checkout:', error); }
    }
    res.json({ received: true });
});

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION & PROFILE ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, shop_name } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
    
    const userRole = role === 'seller' ? 'seller' : 'buyer';
    if (userRole === 'seller' && !shop_name) return res.status(400).json({ error: 'Shop name is required for sellers.' });

    try {
        const existingUser = await db.getAsync("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser) return res.status(400).json({ error: 'Email in use.' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.runAsync(
            "INSERT INTO users (email, password_hash, name, role, shop_name) VALUES (?, ?, ?, ?, ?)", 
            [email, hashedPassword, name, userRole, shop_name || null]
        );
        
        const user = await db.getAsync("SELECT id, email, name, avatar_url, role, shop_name FROM users WHERE id = ?", [result.lastID]);
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required fields missing.' });
    try {
        const user = await db.getAsync("SELECT * FROM users WHERE email = ?", [email]);
        if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials.' });
        
        const payload = { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, role: user.role, shop_name: user.shop_name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: payload });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    const { name, avatar_url } = req.body;
    try {
        await db.runAsync("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?", [name, avatar_url, req.user.id]);
        const updatedUser = await db.getAsync("SELECT id, email, name, avatar_url, role, shop_name FROM users WHERE id = ?", [req.user.id]);
        
        if (!updatedUser) return res.status(404).json({ error: 'User not found. Please log in again.' });

        const token = jwt.sign(updatedUser, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MULTI-VENDOR PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
    const { search, category, sellerId } = req.query;
    try {
        let sql = `
            SELECT p.*, u.shop_name, u.avatar_url as seller_avatar 
            FROM products p 
            JOIN users u ON p.seller_id = u.id 
            WHERE p.stock_quantity > 0
        `;
        const params = [];

        if (category && category !== 'All') {
            sql += " AND p.category = ?";
            params.push(category);
        }
        if (search) {
            sql += " AND p.title LIKE ?";
            params.push(`%${search}%`);
        }
        if (sellerId) {
            sql += " AND p.seller_id = ?";
            params.push(sellerId);
        }

        const products = await db.allAsync(sql, params);
        const parsedProducts = products.map(p => ({ ...p, images: JSON.parse(p.images) }));
        res.json(parsedProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seller adding a product
app.post('/api/products', authenticateToken, async (req, res) => {
    if (req.user.role !== 'seller') return res.status(403).json({ error: 'Only sellers can add products.' });
    
    const { title, price, stock_quantity, images, category, description } = req.body;
    if (!title || !price || !images || !images.length || !category) return res.status(400).json({ error: 'Missing required product fields.' });

    try {
        const result = await db.runAsync(
            "INSERT INTO products (seller_id, title, price, stock_quantity, images, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [req.user.id, title, price, stock_quantity || 0, JSON.stringify(images), category, description || '']
        );
        res.status(201).json({ id: result.lastID, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CHECKOUT ROUTES ---
app.post('/api/checkout/create-session', authenticateToken, async (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart empty.' });
    try {
        let totalAmount = 0;
        const line_items = [];
        const orderItemsData = [];
        for (const item of items) {
            const product = await db.getAsync("SELECT * FROM products WHERE id = ?", [item.productId]);
            if (!product || product.stock_quantity < item.quantity) return res.status(400).json({ error: 'Stock error' });
            
            totalAmount += product.price * item.quantity;
            orderItemsData.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
            
            const imgs = JSON.parse(product.images);
            line_items.push({
                price_data: { currency: 'usd', product_data: { name: product.title, images: [imgs[0]] }, unit_amount: product.price },
                quantity: item.quantity,
            });
        }
        const orderRes = await db.runAsync("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')", [req.user.id, totalAmount]);
        const orderId = orderRes.lastID;
        for (const oi of orderItemsData) {
            await db.runAsync("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)", [orderId, oi.productId, oi.quantity, oi.unitPrice]);
        }
        
        if (!process.env.STRIPE_SECRET_KEY) {
            await db.runAsync("UPDATE orders SET status = 'completed' WHERE id = ?", [orderId]);
            for (const oi of orderItemsData) await db.runAsync("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", [oi.quantity, oi.productId]);
            return res.json({ url: 'http://localhost:5173/success' });
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], line_items, mode: 'payment',
            success_url: 'http://localhost:5173/success', cancel_url: 'http://localhost:5173/cancel',
            metadata: { order_id: orderId }
        });
        await db.runAsync("UPDATE orders SET stripe_session_id = ? WHERE id = ?", [session.id, orderId]);
        res.json({ url: session.url });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
