import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CreditCard, Package } from 'lucide-react';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
            const { data } = await api.post('/checkout/create-session', { items });
            window.location.href = data.url;
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed.');
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <Package size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h2>Your cart is empty</h2>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
                    Return to Catalog
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '2rem auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div>
                    <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Shipping Details</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}><strong>Name:</strong> {user?.name}</p>
                        <p style={{ color: 'var(--text-muted)' }}><strong>Email:</strong> {user?.email}</p>
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
                            <p style={{ fontSize: '0.875rem' }}>Shipping address will be securely collected via Stripe Checkout.</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Order Review</h3>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <img src={item.images[0]} alt={item.title} style={{ width: 50, height: 50, objectFit: 'contain', background: 'var(--background)', borderRadius: '8px' }} />
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{item.title}</h4>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600 }}>
                                    ${((item.price * item.quantity) / 100).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            <span>Subtotal</span>
                            <span>${(cartTotal / 100).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.25rem' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>${(cartTotal / 100).toFixed(2)}</span>
                        </div>
                        
                        {error && <div className="error-msg" style={{ marginTop: '1rem' }}>{error}</div>}
                        
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            <CreditCard size={20} />
                            {loading ? 'Connecting to Stripe...' : 'Pay with Stripe'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
