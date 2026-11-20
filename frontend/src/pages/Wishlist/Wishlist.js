import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, ShoppingCart, X, Eye, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Wishlist.css';
import { toProductSlug } from '../../utils/slug';
import { showCartAddedToast, showOutOfStockToast, showWishlistRemovedToast } from '../../utils/toast';

import { API as _WAPI, IMG as IMG_BASE } from '../../config';
const API_BASE_URL = _WAPI.replace('/api', '');

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, addToCart, cartItems } = useCart();
  const { isLoggedIn, customer } = useAuth();
  const navigate = useNavigate();

  const getImg = (item) => {
    if (item.mainImage) return `${IMG_BASE}/${item.mainImage}`;
    if (item.img && item.img.startsWith('http')) return item.img;
    if (item.img) return item.img;
    return '/assets/placeholder.png';
  };

  const getStock = (item) => {
    if (item.variants && item.variants.length > 0) {
      return item.variants.reduce((s, v) => s + Number(v.quantity || 0), 0);
    }
    return Number(item.totalStock) || 0;
  };

  const getDiscount = (item) => {
    const sale = Number(item.salesPrice || item.price);
    const mrp  = Number(item.mrpPrice);
    if (mrp > sale && mrp > 0) return Math.round(((mrp - sale) / mrp) * 100);
    return 0;
  };

  const handleMoveToCart = (item) => {
    const stock = getStock(item);
    if (stock === 0) { showOutOfStockToast(); return; }

    const alreadyInCart = cartItems?.some(ci => ci.id === item.id);
    if (alreadyInCart) {
      navigate('/cart');
      return;
    }

    addToCart(item, 1);
    removeFromWishlist(item.wishlistItemId || item.id, item.id);
    showCartAddedToast(item.name);
    navigate('/cart');
  };

  const handleRemove = (item) => {
    removeFromWishlist(item.wishlistItemId || item.id, item.id);
    showWishlistRemovedToast(item.name);
  };

  // ✅ Always fetch full product (with thumbnails) before navigating
  const handleProductClick = async (item) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/${item.id}`);
      const fullProduct = res.data;
      // Navigate with full product — thumbnails included
      navigate(`/shop/${toProductSlug(fullProduct)}`, { state: { product: fullProduct } });
    } catch (err) {
      console.error('Failed to fetch full product:', err);
      // Fallback: navigate without thumbnails — ShopDetail will fetch by slug
      navigate(`/shop/${toProductSlug(item)}`, { state: { product: null } });
    }
  };

  /* ── NOT LOGGED IN ── */
  if (!isLoggedIn) {
    return (
      <div className="wishlist-page">
        <div className="wish-login-gate">
          <div className="wish-login-gate-icon">
            <Heart size={38} color="#e8d48b" fill="rgba(232,212,139,0.3)" />
          </div>
          <h2>Your Wishlist Awaits</h2>
          <p>Login to save your favourite pieces and access them from anywhere, anytime.</p>
          <button
            className="wish-login-btn"
            onClick={() => navigate('/login', { state: { from: '/wishlist' } })}
          >
            Login to View Wishlist
          </button>
        </div>
      </div>
    );
  }

  /* ── LOGGED IN ── */
  return (
    <div className="wishlist-page">

      {/* Header */}
      <div className="wishlist-header">
        <h1 className="page-title">My Wishlist</h1>
        <p className="wishlist-subtitle">Your curated collection</p>
        <div className="wishlist-title-bar" />
      </div>

      {/* User banner */}
      {customer && (
        <div className="wish-user-banner">
          <span className="wish-user-dot" />
          <User size={15} />
          <span>
            Signed in as <strong>{customer.name}</strong>
            <span style={{ opacity: 0.7, marginLeft: 6 }}>({customer.email})</span>
          </span>
          {wishlistItems.length > 0 && (
            <span className="wish-count-badge">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-wish-icon">
            <Heart size={72} color="#d1a309" fill="rgba(209,163,9,0.12)" strokeWidth={1.5} />
          </div>
          <h2>Nothing Saved Yet</h2>
          <p>Browse our collections and tap the heart icon to save pieces you love.</p>
          <button className="empty-wish-btn" onClick={() => navigate('/shop')}>
            Explore Shop <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(item => {
            const stock    = getStock(item);
            const inStock  = stock > 0;
            const discount = getDiscount(item);
            const salePrice = Number(item.salesPrice || item.price);
            const mrpPrice  = Number(item.mrpPrice);
            const category  = item.category?.name || '';
            const alreadyInCart = cartItems?.some(ci => ci.id === item.id);

            return (
              <div key={item.wishlistItemId || item.id} className="wishlist-item-card">

                {/* Image area */}
                <div className="img-wrapper" onClick={() => handleProductClick(item)}>
                  <img
                    src={getImg(item)}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  />

                  <span className={`wish-stock-badge ${inStock ? 'in' : 'out'}`}>
                    {inStock ? `In Stock` : 'Out of Stock'}
                  </span>

                  <button
                    className="remove-wish-btn"
                    onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                    title="Remove from Wishlist"
                  >
                    <X size={16} />
                  </button>

                  <div className="wish-view-overlay">
                    <span>View Details</span>
                  </div>
                </div>

                {/* Info */}
                <div className="wish-info">
                  <div className="wish-info-top">
                    <h3 onClick={() => handleProductClick(item)}>{item.name}</h3>
                    {category && <span className="wish-category-tag">{category}</span>}
                  </div>

                  <div className="wish-price-row">
                    <span className="wish-price-sale">
                      ₹{salePrice.toLocaleString('en-IN')}
                    </span>
                    {mrpPrice > salePrice && (
                      <span className="wish-price-mrp">
                        ₹{mrpPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="wish-discount-pill">{discount}% OFF</span>
                    )}
                  </div>

                  <button
                    className={`add-to-cart-from-wish ${!inStock ? 'btn-oos' : ''} ${alreadyInCart && inStock ? 'btn-go-to-cart' : ''}`}
                    onClick={() => handleMoveToCart(item)}
                    disabled={!inStock}
                    title={!inStock ? 'Out of Stock' : alreadyInCart ? 'Go to Cart' : 'Move to Cart'}
                  >
                    <ShoppingCart size={16} />
                    {!inStock
                      ? 'Out of Stock'
                      : alreadyInCart
                        ? 'Go to Cart'
                        : 'Move to Cart'}
                  </button>
                </div>

                {/* View detail link */}
                <button className="wish-view-link" onClick={() => handleProductClick(item)}>
                  <Eye size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  View Full Details
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
