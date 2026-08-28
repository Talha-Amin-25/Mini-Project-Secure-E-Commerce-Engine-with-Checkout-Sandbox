import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Checkout from './pages/Checkout';
import SellerDashboard from './pages/SellerDashboard';

import SideCart from './components/SideCart';
import { useCart } from './context/CartContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = () => {
    const { cart } = useCart();
    const location = useLocation();
    
    // Only show persistent cart sidebar on the main Product Catalog page ('/')
    const showSidebar = cart.length > 0 && location.pathname === '/';

    return (
        <div className="app-container">
            <Navbar />
            <div className={`layout-grid ${showSidebar ? 'with-cart' : ''}`}>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/seller-dashboard" element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />
                        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                        <Route path="/success" element={<Success />} />
                        <Route path="/cancel" element={<Cancel />} />
                    </Routes>
                </main>
                
                {showSidebar && (
                    <aside className="persistent-cart-sidebar">
                        <SideCart />
                    </aside>
                )}
            </div>
        </div>
    );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
