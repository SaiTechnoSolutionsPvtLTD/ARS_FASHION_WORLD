import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Cart.css';

import { IMG as IMG_BASE } from '../../config';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { isLoggedIn, customer } = useAuth();
  const navigate = useNavigate();

  const getImg = (item) => {
    if (item.mainImage) return `${IMG_BASE}/${item.mainImage}`;
    if (item.img && item.img.startsWith('http')) return item.img;
    if (item.img) return item.img;
    return '/assets/placeholder.png';
  };

  const handleRemove = (item) => {
    removeFromCart(item.cartItemId || item.id, item.id);
    toast.error(`${item.name} removed from cart`);
  };

  const handleQtyChange = (item, amount) => {
    updateQuantity(item.cartItemId || item.id, amount, item.id);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout', message: 'Please login to proceed to checkout' } });
      return;
    }
    navigate('/checkout');
  };

  // Total MRP (to compute savings)
  const totalMrp = cartItems.reduce((acc, item) => {
    const mrp = Number(item.mrpPrice) || Number(item.price) || 0;
    return acc + mrp * item.quantity;
  }, 0);
  const totalSavings = totalMrp - totalPrice;

  /* ── EMPTY ── */
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container fade-in">
        <div className="empty-icon-wrapper">
          <ShoppingBag size={72} strokeWidth={1.5} color="#00044a" />
        </div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet. Explore our latest collections.</p>
        <button className="shop-now-btn" onClick={() => navigate('/shop')}>
          Explore Shop <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page fade-in">

      {/* Header */}
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <div className="cart-title-bar" />
        <p className="cart-item-count">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
      </div>

      {/* User banner */}
      {isLoggedIn && customer && (
        <div className="cart-user-banner">
          <span className="cart-user-dot" />
          <User size={15} />
          <span>
            Signed in as <strong>{customer.name}</strong>
            <span style={{ opacity: 0.7, marginLeft: 6 }}>({customer.email})</span>
          </span>
          <span className="cart-saved-badge">Cart Saved ✓</span>
        </div>
      )}

      <div className="cart-flex-container">

        {/* ── LEFT: Items ── */}
        <div className="cart-items-section">
          {cartItems.map(item => {
            const salePrice = Number(item.price);
            const mrpPrice  = Number(item.mrpPrice) || salePrice;
            const subtotal  = salePrice * item.quantity;

            return (
              <div key={item.cartItemId || item.id} className="cart-item-card">

                {/* Image */}
                <div className="cart-img-box">
                  <img
                    src={getImg(item)}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  />
                </div>

                {/* Details */}
                <div className="item-details-box">
                  <div className="item-main-info">
                    <h3>{item.name}</h3>
                    {mrpPrice > salePrice && (
                      <p className="item-mrp-line">
                        MRP: <span className="item-mrp">₹{mrpPrice.toLocaleString('en-IN')}</span>
                      </p>
                    )}
                    <p className="item-price-unit">₹{salePrice.toLocaleString('en-IN')}</p>
                  </div>

                  {/* Quantity */}
                  <div className="premium-qty-selector">
                    <button
                      className="qty-action-btn"
                      onClick={() => handleQtyChange(item, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-number-display">{item.quantity}</span>
                    <button
                      className="qty-action-btn"
                      onClick={() => handleQtyChange(item, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtotal + Delete */}
                <div className="item-total-price">
                  <p className="subtotal-label">Subtotal</p>
                  <p className="price-val">₹{subtotal.toLocaleString('en-IN')}</p>
                  <button className="delete-btn-action" onClick={() => handleRemove(item)} title="Remove">
                    <Trash2 size={17} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Summary ── */}
        <div className="cart-summary-section">
          <h3>Order Summary</h3>

          <div className="cart-summary-inner">
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-text">FREE</span>
              </div>
            </div>

            {/* Savings callout */}
            {totalSavings > 0 && (
              <div className="savings-row">
                <span> You're saving</span>
                <span>₹{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>

            {!isLoggedIn && (
              <div className="cart-login-notice">
                 Login required to checkout
              </div>
            )}

            <button className="checkout-btn" onClick={handleCheckout}>
              {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
              <ArrowRight size={17} />
            </button>

            <div className="secure-checkout-tag">
              100% Secure Checkout
            </div>

            <div className="cart-delivery-strip">
              <span> Free delivery above ₹999</span>
              <span> Easy 7-day returns</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;