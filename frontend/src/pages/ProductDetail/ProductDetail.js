import React, { useState } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Heart, Star, ShoppingBag, CreditCard, ChevronLeft, Plus, Minus, CheckCircle } from 'lucide-react';
import './ProductDetail.css';
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();

  const [qty, setQty] = useState(1);
  const product = location.state?.product;

  if (!product) {
    return (
      <div style={{padding: '150px', textAlign: 'center'}}>
        <h2>Product Details Not Found!</h2>
        <button onClick={() => navigate('/')} style={{marginTop: '20px', padding: '10px 20px', background: '#00044a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
          Go Back to Shop
        </button>
      </div>
    );
  }

  const isInWishlist = wishlistItems?.some(item => item.id === product.id);
  const itemAlreadyInCart = cartItems?.some(item => item.id === product.id);

  const handleIncrease = () => setQty(prev => prev + 1);
  const handleDecrease = () => {
    if (qty > 1) setQty(prev => prev - 1);
  };

  // Logic to determine which price to send to the cart
  const finalPrice = product.offerPrice || product.salePrice || product.price;

  const handleCartAction = () => {
    if (itemAlreadyInCart) {
      navigate('/cart');
    } else {
      addToCart({ ...product, price: finalPrice }, qty);
      showCartAddedToast(product.name);
    }
  };

  return (
    <div className="product-detail-wrapper">
      <div className="container-wrapper">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ChevronLeft size={20} /> Back
        </button>
        
        <div className="detail-grid">
          <div className="detail-image-box">
            <img src={product.img} alt={product.name} />
            {product.tag && <span className="detail-badge">{product.tag}</span>}
          </div>

          <div className="detail-info">
            <span className="detail-category">
              {product.category || product.categories || "Premium Collection"}
            </span>
            <h1>{product.name}</h1>
            
            <div className="detail-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < (product.rating || 5) ? "#d1a309" : "none"} color="#d1a309" />
              ))}
              <span>({product.rating || 5}.0 Rating)</span>
            </div>

            {/* FIXED PRICE SECTION: No more NaN */}
            <div className="detail-pricing">
              {product.offerPrice ? (
                <div className="price-flex">
                  <span className="curr-price offer-color">{product.offerPrice}</span>
                  <span className="old-price">{product.price}</span>
                  <span className="discount-tag">SPECIAL OFFER</span>
                </div>
              ) : product.salePrice ? (
                <div className="price-flex">
                  <span className="curr-price">{product.salePrice}</span>
                  <span className="old-price">{product.price}</span>
                </div>
              ) : (
                <div className="price-flex">
                  <span className="curr-price">{product.price}</span>
                  {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
                </div>
              )}
            </div>

            <div className="stock-info">
              <CheckCircle size={16} color="#2e7d32" />
              <span>In Stock - Ready to Dispatch</span>
            </div>

            <p className="detail-desc">
              Experience luxury with our {product.name}. Carefully crafted using premium materials 
              to ensure both style and durability. This piece is a perfect addition to your 
              wardrobe for any special occasion.
            </p>

            {!itemAlreadyInCart && (
              <div className="quantity-section">
                <span className="qty-label">Quantity</span>
                <div className="qty-box">
                  <button onClick={handleDecrease} className="qty-btn">
                    <Minus size={18} color="white" />
                  </button>
                  <span className="qty-input">{qty}</span>
                  <button onClick={handleIncrease} className="qty-btn">
                    <Plus size={18} color="white" />
                  </button>
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button 
                className={`btn-add-cart ${itemAlreadyInCart ? 'go-to-cart-mode' : ''}`} 
                onClick={handleCartAction}
              >
                <ShoppingBag size={20} /> {itemAlreadyInCart ? 'GO TO CART' : 'ADD TO CART'}
              </button>
              
              <button 
                className="btn-buy-now" 
                onClick={() => { 
                   if(!itemAlreadyInCart) addToCart({ ...product, price: finalPrice }, qty); 
                   navigate('/checkout'); 
                }}
              >
                <CreditCard size={20} /> BUY NOW
              </button>

              <button 
                className={`btn-wishlist ${isInWishlist ? 'active' : ''}`} 
                onClick={() => {
                  addToWishlist(product);
                  if (isInWishlist) showWishlistRemovedToast(product.name);
                  else showWishlistAddedToast(product.name);
                }}
              >
                <Heart size={20} fill={isInWishlist ? "red" : "none"} color={isInWishlist ? "red" : "#333"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
