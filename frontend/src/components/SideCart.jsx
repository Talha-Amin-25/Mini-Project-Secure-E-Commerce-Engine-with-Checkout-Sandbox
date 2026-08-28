import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SideCart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Your Cart</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cart.map(item => (
                        <div key={item.id} className="cart-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <img src={item.images[0]} alt={item.title} style={{ width: 60, height: 60, objectFit: 'contain', background: 'var(--background)', borderRadius: '8px' }} />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{item.title}</h4>
                                <p style={{ color: 'var(--primary)', fontWeight: 700, margin: '0.25rem 0' }}>
                                    ${(item.price / 100).toFixed(2)}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock_quantity)}>
                                        <Minus size={14} />
                                    </button>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</span>
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock_quantity)} disabled={item.quantity >= item.stock_quantity}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            <button className="btn-icon" onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600 }}>Subtotal</span>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>${(cartTotal / 100).toFixed(2)}</span>
                </div>
                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={() => navigate('/checkout')}
                >
                    Review & Checkout
                </button>
                <button onClick={clearCart} style={{ width: '100%', marginTop: '0.75rem', color: 'var(--danger)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Clear Cart
                </button>
            </div>
        </div>
    );
};

export default SideCart;
