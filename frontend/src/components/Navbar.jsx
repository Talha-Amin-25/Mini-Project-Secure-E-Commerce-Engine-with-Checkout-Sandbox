import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, LogOut, Package, Sun, Moon, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import SideCart from './SideCart';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { itemCount, setIsCartOpen } = useCart();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate(`/`);
        }
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/login');
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="nav-brand">
                        <Package size={28} />
                        <span>TechStore</span>
                    </Link>
                    
                    <form className="nav-search" onSubmit={handleSearch}>
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    
                    <div className="nav-links">
                        <button onClick={toggleTheme} className="nav-icon-btn" aria-label="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        
                        <Link to="/cart" className="nav-icon-btn" style={{ position: 'relative' }} aria-label="View Cart">
                            <ShoppingCart size={24} />
                            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        </Link>
                        
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {user.role === 'seller' && (
                                    <Link to="/seller-dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                                        <Package size={16} />
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <img src={user.avatar_url} alt="Profile" className="avatar-img" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                                </Link>
                                <button onClick={() => setShowLogoutModal(true)} className="nav-icon-btn" aria-label="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}>
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <LogOut size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ marginBottom: '1rem' }}>Disconnect from Mainframe?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Are you sure you want to log out of your session?</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmLogout}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
