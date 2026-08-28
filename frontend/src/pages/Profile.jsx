import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const avatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Beta',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Gamma',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Delta',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Epsilon',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Zeta',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Omega',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Prime'
];

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || avatars[0]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        
        try {
            await updateProfile(name, selectedAvatar);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Profile Settings</h1>
            
            <div className="card" style={{ padding: '2rem' }}>
                {status.message && (
                    <div className="error-msg" style={{ 
                        backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : '',
                        borderColor: status.type === 'success' ? 'var(--secondary)' : '',
                        color: status.type === 'success' ? 'var(--secondary)' : ''
                    }}>
                        {status.message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ marginBottom: '1rem' }}>Select Avatar</label>
                        <div className="avatar-gallery">
                            {avatars.map(url => (
                                <img 
                                    key={url}
                                    src={url} 
                                    alt="Avatar Option"
                                    className={`avatar-option ${selectedAvatar === url ? 'selected' : ''}`}
                                    onClick={() => setSelectedAvatar(url)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={user?.email}
                            disabled 
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>Email cannot be changed.</small>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
