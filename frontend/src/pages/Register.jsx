import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Store } from 'lucide-react';
import api from '../api';

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Multi-vendor toggle
    const [isSeller, setIsSeller] = useState(false);
    const [shopName, setShopName] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                name, email, password,
                role: isSeller ? 'seller' : 'buyer',
                shop_name: isSeller ? shopName : null
            };
            const { data } = await api.post('/auth/register', payload);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Reload to update AuthContext state properly
            window.location.href = '/'; 
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: 500, width: '100%', padding: '2.5rem', background: 'var(--surface-glass)', backdropFilter: 'blur(10px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {isSeller ? (
                        <Store size={48} color="var(--primary)" style={{ filter: 'drop-shadow(var(--neon-glow))', marginBottom: '1rem' }} />
                    ) : (
                        <UserPlus size={48} color="var(--primary)" style={{ filter: 'drop-shadow(var(--neon-glow))', marginBottom: '1rem' }} />
                    )}
                    <h2>{isSeller ? 'Open a Shop' : 'Create Account'}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isSeller ? 'Start selling your tech on our marketplace.' : 'Join the most futuristic marketplace.'}
                    </p>
                </div>
                
                {error && <div className="error-msg">{error}</div>}

                {/* Role Toggles */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--background)', padding: '0.25rem', borderRadius: '99px' }}>
                    <button 
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '99px', background: !isSeller ? 'var(--primary)' : 'transparent', color: !isSeller ? '#000' : 'var(--text-main)', fontWeight: 600, transition: 'all 0.2s' }}
                        onClick={() => setIsSeller(false)} type="button"
                    >
                        Buyer
                    </button>
                    <button 
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '99px', background: isSeller ? 'var(--primary)' : 'transparent', color: isSeller ? '#000' : 'var(--text-main)', fontWeight: 600, transition: 'all 0.2s' }}
                        onClick={() => setIsSeller(true)} type="button"
                    >
                        Seller
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {isSeller && (
                        <div className="form-group">
                            <label className="form-label">Shop Name</label>
                            <input type="text" className="form-input" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Initializing...' : (isSeller ? 'Open Shop' : 'Register')}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
