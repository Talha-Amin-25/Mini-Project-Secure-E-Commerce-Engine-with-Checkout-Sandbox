import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: 450, width: '100%', padding: '2.5rem', background: 'var(--surface-glass)', backdropFilter: 'blur(10px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <LogIn size={48} color="var(--primary)" style={{ filter: 'drop-shadow(var(--neon-glow))', marginBottom: '1rem' }} />
                    <h2>Access Mainframe</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
                </div>
                
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Need an account? </span>
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
