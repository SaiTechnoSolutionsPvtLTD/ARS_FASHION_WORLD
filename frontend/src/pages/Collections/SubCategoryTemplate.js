import React, { useState } from 'react';
import './SubCollection.css';
import { toProductSlug } from '../../utils/slug';
import { 
  FaHeart, FaEye, FaTimes, FaShoppingCart, 
  FaPlus, FaMinus, FaCreditCard, FaCheckCircle, 
  FaStar, FaBoxOpen 
} from 'react-icons/fa'; 
import { useCart } from '../../context/CartContext'; 
import { useNavigate } from 'react-router-dom'; 
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';
import { IMG as API_BASE_URL } from '../../config';

const SubCategoryTemplate = ({ title, products }) => {
  const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart(); 
  const navigate = useNavigate(); 
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const isInWishlist = (id) => wishlistItems?.some(item => item.id === id);
  const isInCart = (id) => cartItems?.some(item => item.id === id);

  const formatPrice = (val) => {
    if (val === null || val === undefined || val === '' || Number(val) === 0) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const getActivePrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      return Number(product.variants[0].salesPrice) || 0;
    }
    return Number(product.salesPrice) || 0;
  };

  const getMrpPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      return Number(product.variants[0].mrpPrice) || 0;
    }
    return Number(product.mrpPrice) || 0;
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setQuantity(1);
  };

  const handleDecrement = () => { if (quantity > 1) setQuantity(prev => prev - 1); };
  const handleIncrement = () => { setQuantity(prev => prev + 1); };
  
  const handleProductNavigate = (product) => navigate(`/shop/${toProductSlug(product)}`, { state: { product } });

  const handleCartAction = (product, qty) => {
    const activePrice = getActivePrice(product); 
    if (isInCart(product.id)) {
      navigate('/cart'); 
    } else {
      addToCart({ ...product, price: activePrice, quantity: qty });
      showCartAddedToast(product.name);
      if (showModal) closeModal();
    }
  };

  const handleBuyNow = (product, qty) => {
    const activePrice = getActivePrice(product); 
    if (!isInCart(product.id)) addToCart({ ...product, price: activePrice, quantity: qty });
    if (showModal) closeModal();
    navigate('/checkout'); 
  };

  const handleWishlistAction = (product) => {
    const isPresent = isInWishlist(product.id);
    addToWishlist(product); 
    if (isPresent) showWishlistRemovedToast(product.name);
    else showWishlistAddedToast(product.name);
  };

  return (
    <div className="sub-category-page">
      <div className="sub-banner">
        <div className="banner-overlay">
          <h1>{title}</h1>
          <p className="breadcrumb">Home / Collections / {title}</p>
        </div>
      </div>

      <div className="product-grid-layout">
        {products && products.length > 0 ? (
          products.map(item => {
            // ✅ FIXED: Use correct backend field names
            const activePrice = getActivePrice(item);
            const originalPrice = getMrpPrice(item);
            const hasDiscount = originalPrice > activePrice && originalPrice > 0;
            const discountPct = hasDiscount
              ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
              : 0;
            const savedAmount = hasDiscount ? originalPrice - activePrice : 0;
            
            const imageUrl = item.mainImage 
              ? `${API_BASE_URL}/${item.mainImage}` 
              : '/assets/placeholder.png';

            const inStock = item.totalStock > 0;

            return (
              <div className="item-card animate-fade-in" key={item.id}>
                <div className="image-box" onClick={() => handleProductNavigate(item)}>
                  <img 
                    src={imageUrl} 
                    alt={item.name} 
                    onError={(e) => { e.target.src = '/assets/placeholder.png'; }} 
                  />

                  {/* Badges */}
                  {hasDiscount && (
                    <span className="sale-badge">-{discountPct}%</span>
                  )}
                  {!inStock && (
                    <span className="oos-badge">Out of Stock</span>
                  )}
                  
                  <div className="hover-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`action-icon ${isInWishlist(item.id) ? 'active-wish' : ''}`} 
                      onClick={(e) => { e.stopPropagation(); handleWishlistAction(item); }}
                      title="Wishlist"
                    >
                      <FaHeart />
                    </button>

                    <button 
                      className={`grid-add-to-cart ${isInCart(item.id) ? 'go-to-cart-mode' : ''} ${!inStock ? 'out-of-stock-mode' : ''}`} 
                      onClick={(e) => { e.stopPropagation(); if (inStock) handleCartAction(item, 1); }}
                      disabled={!inStock}
                    >
                      <FaShoppingCart size={14} />
                      <span>{!inStock ? 'OUT OF STOCK' : isInCart(item.id) ? 'GO TO CART' : 'ADD TO CART'}</span>
                    </button>

                    <button 
                      className="action-icon" 
                      onClick={(e) => { e.stopPropagation(); openModal(item); }} 
                      title="Quick View"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
                
                <div className="item-info" onClick={() => handleProductNavigate(item)}>
                  <p className="item-category">{item.category?.name || 'ARS Collection'}</p>
                  <h3 className="product-title-text">{item.name}</h3>

                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < (item.rating || 5) ? "star-active" : "star-inactive"} size={12} />
                    ))}
                  </div>

                  <div className="pricing-block">
                    <span className="price-active" style={{ color: hasDiscount ? '#d32f2f' : '#00044a' }}>
                      {formatPrice(activePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="price-old">{formatPrice(originalPrice)}</span>
                    )}
                  </div>

                  {/*  NEW: You Save tag */}
                  {hasDiscount && (
                    <span className="you-save-tag">
                      Save {formatPrice(savedAmount)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-collection-state">
            <FaBoxOpen size={50} />
            <h2>No items found in {title}</h2>
            <p>We are currently updating this collection. Check back soon!</p>
            <button onClick={() => navigate('/shop')} className="btn-back-shop">
              Explore All Products
            </button>
          </div>
        )}
      </div>

      {/* ═══ Quick View Modal ═══ */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={closeModal}>
        {selectedProduct && (() => {
          //  FIXED: Modal also uses correct price fields
          const modalActivePrice = getActivePrice(selectedProduct);
          const modalMrpPrice = getMrpPrice(selectedProduct);
          const modalHasDiscount = modalMrpPrice > modalActivePrice && modalMrpPrice > 0;
          const modalSaved = modalHasDiscount ? modalMrpPrice - modalActivePrice : 0;
          const modalDiscount = modalHasDiscount
            ? Math.round(((modalMrpPrice - modalActivePrice) / modalMrpPrice) * 100)
            : 0;

          return (
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}><FaTimes size={18}/></button>
              <div className="qv-flex-container">

                {/* LEFT: Image */}
                <div className="qv-left-image">
                  <div className="qv-img-wrapper">
                    <img 
                      src={`${API_BASE_URL}/${selectedProduct.mainImage}`} 
                      alt={selectedProduct.name}
                      onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                    />
                  </div>
                  {modalHasDiscount && (
                    <div className="qv-img-badges">
                      <span className="qv-discount-badge">-{modalDiscount}% OFF</span>
                    </div>
                  )}
                </div>

                {/* RIGHT: Details */}
                <div className="qv-right-details">
                  <span className="qv-brand">ARS FASHION HUB</span>
                  <h2>{selectedProduct.name}</h2>
                  <p className="qv-category-tag">{selectedProduct.category?.name}</p>

                  {/* Price Row */}
                  <div className="qv-price-row">
                    <span className="qv-price-current" style={{ color: modalHasDiscount ? '#d32f2f' : '#00044a' }}>
                      {formatPrice(modalActivePrice)}
                    </span>
                    {modalHasDiscount && (
                      <>
                        <span className="qv-price-old">{formatPrice(modalMrpPrice)}</span>
                        <span className="qv-save-pill">Save {formatPrice(modalSaved)}</span>
                      </>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="qv-stock-status">
                    {selectedProduct.totalStock > 0 ? (
                      <span className="stock-tag in">
                        <FaCheckCircle size={12}/> In Stock ({selectedProduct.totalStock} units)
                      </span>
                    ) : (
                      <span className="stock-tag out">Out of Stock</span>
                    )}
                  </div>

                  <div className="qv-body-content">
                    <p className="qv-desc">
                      {selectedProduct.description || "Handcrafted elegance for your unique style."}
                    </p>
                    
                    {selectedProduct.totalStock > 0 && !isInCart(selectedProduct.id) && (
                      <div className="quantity-section">
                        <span className="qty-label">Quantity</span>
                        <div className="quantity-controls">
                          <button className="qty-btn" onClick={handleDecrement} disabled={quantity <= 1}>
                            <FaMinus/>
                          </button>
                          <span className="qty-val">{quantity}</span>
                          <button className="qty-btn" onClick={handleIncrement} disabled={quantity >= selectedProduct.totalStock}>
                            <FaPlus/>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="qv-footer-actions">
                    <button 
                      className="btn-primary buy" 
                      onClick={() => handleBuyNow(selectedProduct, quantity)}
                      disabled={selectedProduct.totalStock === 0}
                    >
                      <FaCreditCard /> BUY IT NOW
                    </button>
                    <div className="btn-group-row">
                      <button 
                        className={`btn-secondary cart ${isInCart(selectedProduct.id) ? 'go-to-cart-mode' : ''}`} 
                        onClick={() => handleCartAction(selectedProduct, quantity)}
                        disabled={selectedProduct.totalStock === 0}
                      >
                        <FaShoppingCart /> 
                        {isInCart(selectedProduct.id) ? 'VIEW CART' : 'ADD TO CART'}
                      </button>
                      <button
                        className={`btn-wishlist-toggle ${isInWishlist(selectedProduct.id) ? 'is-active' : ''}`}
                        onClick={() => handleWishlistAction(selectedProduct)}
                        title={isInWishlist(selectedProduct.id) ? 'In Wishlist' : 'Add to Wishlist'}
                      >
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default SubCategoryTemplate;