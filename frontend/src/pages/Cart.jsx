import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState('');

    const handleCheckout = async () => {
        setCheckingOut(true);
        setError('');
        try {
            const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
            const { data } = await api.post('/checkout/create-session', { items });
            
            // Redirect to Stripe checkout URL (or local success page if dummy mode)
            window.location.href = data.url;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate checkout.');
            setCheckingOut(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2>Your cart is empty</h2>
                <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="btn btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
            {error && <div className="error-msg">{error}</div>}
            
            <div className="card">
                {cart.map(item => (
                    <div key={item.id} className="cart-item">
                        <img src={item.image_url} alt={item.title} className="cart-item-img" />
                        <div className="cart-item-details">
                            <h3 style={{ fontSize: '1.125rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--primary)', fontWeight: 700, margin: '0.25rem 0' }}>
                                ${(item.price / 100).toFixed(2)}
                            </p>
                        </div>
                        <div className="cart-item-actions">
                            <button 
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock_quantity)}
                            >
                                <Minus size={14} />
                            </button>
                            <span style={{ width: '20px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                            <button 
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock_quantity)}
                                disabled={item.quantity >= item.stock_quantity}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <button 
                            className="btn-icon danger" 
                            style={{ marginLeft: '1rem' }}
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Total:</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Shipping and taxes calculated at checkout.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ${(cartTotal / 100).toFixed(2)}
                    </span>
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}
                        onClick={handleCheckout}
                        disabled={checkingOut}
                    >
                        <CreditCard size={20} />
                        {checkingOut ? 'Processing...' : 'Checkout'}
                    </button>
                </div>
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                <button onClick={clearCart} className="btn btn-outline" style={{ color: 'var(--danger)' }}>
                    Clear Cart
                </button>
            </div>
        </div>
    );
};

export default Cart;
