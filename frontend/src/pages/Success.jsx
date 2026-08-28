import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Success = () => {
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear the cart when checkout is successfully completed
        clearCart();
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
            <CheckCircle size={64} color="var(--secondary)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ marginBottom: '1rem' }}>Payment Successful!</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.125rem' }}>
                Thank you for your purchase. Your order has been placed and inventory has been updated securely via the Stripe Webhook.
            </p>
            <Link to="/" className="btn btn-primary">
                Continue Shopping
            </Link>
        </div>
    );
};

export default Success;
