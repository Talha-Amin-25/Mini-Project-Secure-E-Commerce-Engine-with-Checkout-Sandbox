import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart, cart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const searchQuery = searchParams.get('search') || '';
    const categoryQuery = searchParams.get('category') || 'All';
    const categories = ['All', 'Gaming', 'Peripherals', 'Displays', 'Audio'];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/products?';
                if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
                if (categoryQuery) url += `category=${encodeURIComponent(categoryQuery)}`;
                
                const { data } = await api.get(url);
                setProducts(data);
            } catch (err) {
                setError('Failed to load products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchQuery, categoryQuery]);

    const setCategory = (cat) => {
        if (cat === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
    };

    // Component for handling multiple images in a card
    const ImageCarousel = ({ images, title }) => {
        const [index, setIndex] = useState(0);
        const next = (e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length); };
        const prev = (e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length); };

        return (
            <div className="product-img-wrapper">
                <img src={images[index]} alt={title} className="product-img" />
                {images.length > 1 && (
                    <>
                        <button className="carousel-btn left" onClick={prev}><ChevronLeft size={20}/></button>
                        <button className="carousel-btn right" onClick={next}><ChevronRight size={20}/></button>
                        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
                            {images.map((_, i) => (
                                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === index ? 'var(--primary)' : 'rgba(255,255,255,0.5)' }}></div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Product Catalog</h1>
            </div>

            <div className="category-pills">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        className={`pill ${categoryQuery === cat ? 'active' : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div>Scanning inventory...</div>
            ) : error ? (
                <div className="error-msg">{error}</div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
                    <h2>No products found</h2>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map(product => {
                        const cartItem = cart.find(item => item.id === product.id);
                        const currentQtyInCart = cartItem ? cartItem.quantity : 0;
                        const isOutOfStock = product.stock_quantity === 0;
                        const canAddToCart = currentQtyInCart < product.stock_quantity;

                        return (
                            <div key={product.id} className="card">
                                <ImageCarousel images={product.images} title={product.title} />
                                <div className="product-info">
                                    <span className="product-category">{product.category}</span>
                                    <h3 className="product-title">{product.title}</h3>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
                                        <img src={product.seller_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'} alt="Seller" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sold by: <strong>{product.shop_name || 'TechStore'}</strong></span>
                                    </div>

                                    <p className="product-desc">{product.description}</p>
                                    
                                    <div className="product-meta">
                                        <span className="product-price">${(product.price / 100).toFixed(2)}</span>
                                        <span className={`stock-tag ${product.stock_quantity < 10 ? 'low' : ''}`}>
                                            {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} left`}
                                        </span>
                                    </div>
                                    
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ width: '100%' }}
                                        onClick={() => addToCart(product)}
                                        disabled={isOutOfStock || !canAddToCart}
                                    >
                                        <ShoppingCart size={18} />
                                        {canAddToCart ? 'Add to Cart' : 'Max Stock Reached'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Home;
