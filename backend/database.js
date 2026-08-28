const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeSchema();
    }
});

function initializeSchema() {
    db.serialize(async () => {
        // Drop existing tables for the schema upgrade
        db.run(`DROP TABLE IF EXISTS order_items`);
        db.run(`DROP TABLE IF EXISTS orders`);
        db.run(`DROP TABLE IF EXISTS products`);
        db.run(`DROP TABLE IF EXISTS users`);

        // Users Table (Added role and shop_name)
        db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
                role TEXT DEFAULT 'buyer',
                shop_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products Table (Added seller_id)
        db.run(`
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                price INTEGER NOT NULL,
                stock_quantity INTEGER NOT NULL DEFAULT 0,
                images TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY(seller_id) REFERENCES users(id)
            )
        `);

        // Orders Table
        db.run(`
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                stripe_session_id TEXT,
                total_amount INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Order Items Table
        db.run(`
            CREATE TABLE order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price INTEGER NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `);

        // Seed Users and Products
        const pass = await bcrypt.hash('password123', 10);
        
        console.log("Seeding sellers and products...");
        db.run("INSERT INTO users (email, password_hash, name, role, shop_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)", 
            ['seller@techstore.com', pass, 'Admin', 'seller', 'CyberTech Solutions', 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'],
            function(err) {
                if (err) return console.error(err);
                const sellerId = this.lastID;
                
                const stmt = db.prepare("INSERT INTO products (seller_id, title, price, stock_quantity, images, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
                
                stmt.run(
                    sellerId,
                    "Quantum VR Headset", 
                    49900, 
                    25, 
                    JSON.stringify(["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&q=80", "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&q=80"]), 
                    "Gaming",
                    "Immersive 8K virtual reality headset with haptic feedback controllers."
                );
                stmt.run(
                    sellerId,
                    "Cyber Mechanical Keyboard", 
                    15900, 
                    50, 
                    JSON.stringify(["https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80"]), 
                    "Peripherals",
                    "Neon-backlit mechanical keyboard featuring custom linear switches and aerospace-grade aluminum chassis."
                );
                stmt.run(
                    sellerId,
                    "Neural Link Display 4K", 
                    89900, 
                    15, 
                    JSON.stringify(["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"]), 
                    "Displays",
                    "32-inch bezel-less OLED display with 240Hz refresh rate and ultra-low latency."
                );
                stmt.finalize();
            }
        );
    });
}

// Promisified wrappers
db.allAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        this.all(sql, params, function (err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

db.getAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        this.get(sql, params, function (err, row) {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

module.exports = db;
