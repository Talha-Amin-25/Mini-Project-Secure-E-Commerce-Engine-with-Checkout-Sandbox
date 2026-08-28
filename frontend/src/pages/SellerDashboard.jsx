import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { PackagePlus, LayoutDashboard, Store } from 'lucide-react';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    
    // Form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('Gaming');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchMyProducts = async () => {
        try {
            const { data } = await api.get(`/products?sellerId=${user.id}`);
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, [user.id]);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Price is stored in cents
            const priceInCents = Math.round(parseFloat(price) * 100);
            
            await api.post('/products', {
                title,
                price: priceInCents,
                stock_quantity: parseInt(stock),
                category,
                images: [imageUrl],
                description
            });
            
            setSuccess('Product added successfully!');
            setTitle(''); setPrice(''); setStock(''); setImageUrl(''); setDescription('');
            fetchMyProducts();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    if (user.role !== 'seller') {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Access Denied. Sellers only.</h2></div>;
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Store size={32} color="var(--primary)" />
                <div>
                    <h1 style={{ margin: 0 }}>Seller Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your shop: <strong>{user.shop_name}</strong></p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Add Product Form */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <PackagePlus size={20} color="var(--primary)" />
                        Add New Product
                    </h3>

                    {error && <div className="error-msg">{error}</div>}
                    {success && <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--secondary)' }}>{success}</div>}

                    <form onSubmit={handleAddProduct}>
                        <div className="form-group">
                            <label className="form-label">Product Title</label>
                            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Price ($)</label>
                                <input type="number" step="0.01" min="0" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock Quantity</label>
                                <input type="number" min="1" className="form-input" value={stock} onChange={e => setStock(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Gaming">Gaming</option>
                                <option value="Peripherals">Peripherals</option>
                                <option value="Displays">Displays</option>
                                <option value="Audio">Audio</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Image URL (Unsplash/Imgur etc.)</label>
                            <input type="url" className="form-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows="3" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Adding...' : 'Publish Product'}
                        </button>
                    </form>
                </div>

                {/* Inventory List */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <LayoutDashboard size={20} color="var(--primary)" />
                        Your Inventory ({products.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {products.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>You haven't added any products yet.</p>
                        ) : (
                            products.map(p => (
                                <div key={p.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <img src={p.images[0]} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{p.title}</h4>
                                        <p style={{ margin: '0.25rem 0', color: 'var(--primary)', fontWeight: 600 }}>${(p.price / 100).toFixed(2)}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock: {p.stock_quantity} • {p.category}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
