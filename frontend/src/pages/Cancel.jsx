import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const Cancel = () => {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
            <XCircle size={64} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ marginBottom: '1rem' }}>Checkout Cancelled</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.125rem' }}>
                It looks like you cancelled the checkout process. Your cart has been saved so you can complete your purchase later.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/cart" className="btn btn-outline">
                    Return to Cart
                </Link>
                <Link to="/" className="btn btn-primary">
                    Browse Products
                </Link>
            </div>
        </div>
    );
};

export default Cancel;
