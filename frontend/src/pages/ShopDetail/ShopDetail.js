import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import {
  FaHeart, FaShoppingCart, FaCreditCard,
  FaChevronLeft, FaMinus, FaPlus, FaTag, FaCheckCircle,
  FaStar, FaUserCircle, FaEye
} from 'react-icons/fa';
import { toProductSlug } from '../../utils/slug';
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';
import './ShopDetail.css';

import { API as _SDAPI } from '../../config';
const API_BASE_URL = _SDAPI.replace('/api', '');
const IMG_BASE = `${API_BASE_URL}/uploads/`;

const ShopDetail = () => {
  const { state }  = useLocation();
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();

  /* ─── Product States ─── */
  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [quantity, setQuantity]           = useState(1);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImg, setActiveImg]         = useState('');

  /* ─── Reviews ─── */
  const [reviews, setReviews]               = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  /* ─── Similar ─── */
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading]   = useState(false);

  /* ─── Fetch product by slug ─── */
  useEffect(() => {
    if (!slug) return;
    setProduct(null);
    setLoading(true);
    setActiveImg('');
    setQuantity(1);
    setSelectedSize(null);
    setSelectedColor(null);
    setSimilarProducts([]);
    setReviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    axios.get(`${API_BASE_URL}/api/products/slug/${slug}`)
      .then(res => setProduct(res.data))
      .catch(() => { if (state?.product) setProduct(state.product); })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ─── Similar products ─── */
  useEffect(() => {
    const categoryId = product?.categoryId || product?.category?.id;
    if (!categoryId || !product?.id) return;
    setSimilarLoading(true);
    axios.get(`${API_BASE_URL}/api/products/by-category/${categoryId}`)
      .then(res => {
        setSimilarProducts(res.data.filter(p => p.id !== product.id).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setSimilarLoading(false));
  }, [product?.id, product?.categoryId, product?.category?.id]);

  /* ─── Reviews ─── */
  useEffect(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    const fetch = () =>
      axios.get(`${API_BASE_URL}/api/reviews/product/${product.id}`)
        .then(res => { setReviews(res.data); setReviewsLoading(false); })
        .catch(() => setReviewsLoading(false));
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, [product?.id]);

  /* ─── Set image + defaults when product loads ─── */
  useEffect(() => {
    if (!product) return;
    setActiveImg(`${IMG_BASE}${product.mainImage}`);
    if (product.variants?.length > 0) {
      const sizes  = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
      const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
      if (sizes.length)  setSelectedSize(sizes[0]);
      if (colors.length) setSelectedColor(colors[0]);
    }
  }, [product]);

  /* ─── Memos ─── */
  const allVariants  = useMemo(() => product?.variants || [], [product]);
  const uniqueSizes  = useMemo(() => [...new Set(allVariants.map(v => v.size).filter(Boolean))],  [allVariants]);
  const uniqueColors = useMemo(() => [...new Set(allVariants.map(v => v.color).filter(Boolean))], [allVariants]);

  const matchedVariant = useMemo(() => {
    if (!allVariants.length) return null;
    return (
      allVariants.find(v => v.size === selectedSize && v.color === selectedColor) ||
      (selectedSize  && allVariants.find(v => v.size  === selectedSize))  ||
      (selectedColor && allVariants.find(v => v.color === selectedColor)) ||
      allVariants[0]
    );
  }, [allVariants, selectedSize, selectedColor]);

  /* ─── Early returns ─── */
  if (loading) return (
    <div className="sd-loader">
      <div className="sd-spinner" />
      <span>Loading Product...</span>
    </div>
  );
  if (!product) return <div className="sd-loader sd-loader--error">Product Not Found</div>;

  /* ─── Price ─── */
  const salesPrice  = matchedVariant ? Number(matchedVariant.salesPrice) : Number(product.salesPrice) || 0;
  const mrpPrice    = matchedVariant ? Number(matchedVariant.mrpPrice)   : Number(product.mrpPrice)   || salesPrice;
  const discount    = mrpPrice > salesPrice && mrpPrice > 0 ? Math.round(((mrpPrice - salesPrice) / mrpPrice) * 100) : 0;
  const savedAmount = mrpPrice > salesPrice ? mrpPrice - salesPrice : 0;

  /* ─── Status ─── */
  const isInWishlist      = !!wishlistItems?.some(i => i.id === product.id);
  const itemAlreadyInCart = !!cartItems?.some(i => i.id === product.id);
  const computedStock     = product.totalStock != null
    ? Number(product.totalStock)
    : (product.variants?.length > 0
        ? product.variants.reduce((sum, v) => sum + Number(v.quantity || 0), 0)
        : 0);
  const inStock = computedStock > 0;

  /* ─── Thumbnails ─── */
  const extraThumbs = (product.thumbnails || []).filter(t => t.image && t.image !== product.mainImage);

  /* ─── Reviews helpers ─── */
  const avgRating  = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : null;
  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <FaStar key={i} style={{ color: i < count ? '#d1a309' : '#ddd', fontSize: '13px' }} />
    ));

  /* ─── Handlers ─── */
  const handleCartAction = () => {
    if (!inStock) return;
    if (itemAlreadyInCart) { navigate('/cart'); return; }
    addToCart({ ...product, price: salesPrice, quantity, selectedVariant: matchedVariant });
    showCartAddedToast(product.name);
  };

  const handleWishlist = () => {
    if (!inStock) return;
    addToWishlist(product);
    if (isInWishlist) showWishlistRemovedToast(product.name);
    else showWishlistAddedToast(product.name);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart({ ...product, price: salesPrice, quantity, selectedVariant: matchedVariant });
    navigate('/checkout');
  };

  /* ─── Similar helpers ─── */
  const getSimilarStock = (p) => {
    if (p.totalStock != null) return Number(p.totalStock) > 0;
    if (p.variants?.length > 0) return p.variants.reduce((s, v) => s + Number(v.quantity || 0), 0) > 0;
    return false;
  };

  const getSimilarDisplayPrices = (p) => {
    const variantPriceSource = p.variants?.find(v =>
      Number(v.salesPrice || 0) > 0 || Number(v.mrpPrice || 0) > 0
    );

    const sales = variantPriceSource
      ? Number(variantPriceSource.salesPrice) || 0
      : Number(p.salesPrice) || 0;

    const mrp = variantPriceSource
      ? Number(variantPriceSource.mrpPrice) || sales
      : Number(p.mrpPrice) || sales;

    return { sales, mrp };
  };

  const goToSimilar = (sim) => navigate(`/shop/${toProductSlug(sim)}`);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="sd-wrapper">
      <div className="sd-container">
        <button className="sd-back" onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back to Shop
        </button>

        <div className="sd-layout">

          {/* ══ LEFT: IMAGES ══ */}
          <div className="sd-images">
            <div className="sd-main-img-box">
              {discount > 0 && (
                <div className="sd-badge-wrap">
                  <span className="sd-discount-badge">{discount}% OFF</span>
                  <span className="sd-save-badge">Save ₹{Number(savedAmount).toLocaleString()}</span>
                </div>
              )}
              {!inStock && <span className="sd-oos-badge">Out of Stock</span>}
              <img
                src={activeImg}
                alt={product.name}
                className="sd-main-img"
                key={activeImg}
                style={{ animation: 'sd-scaleIn 0.35s ease both' }}
              />
            </div>

            {extraThumbs.length > 0 && (
              <div className="sd-thumbs">
                <div
                  className={`sd-thumb-wrap ${activeImg === `${IMG_BASE}${product.mainImage}` ? 'sd-thumb--active' : ''}`}
                  onClick={() => setActiveImg(`${IMG_BASE}${product.mainImage}`)}
                >
                  <img src={`${IMG_BASE}${product.mainImage}`} alt="main" className="sd-thumb"
                    onError={e => { e.target.src = '/assets/placeholder.png'; }} />
                </div>
                {extraThumbs.map((t, idx) => {
                  const src = `${IMG_BASE}${t.image}`;
                  return (
                    <div key={t.id || idx}
                      className={`sd-thumb-wrap ${activeImg === src ? 'sd-thumb--active' : ''}`}
                      onClick={() => setActiveImg(src)}
                    >
                      <img src={src} alt={`view-${idx + 1}`} className="sd-thumb"
                        onError={e => { e.target.src = '/assets/placeholder.png'; }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ RIGHT: INFO ══ */}
          <div className="sd-info">
            <p className="sd-breadcrumb">
              <span onClick={() => navigate('/shop')}>Shop</span>
              {' › '}{product.category?.name}
            </p>

            <h1 className="sd-title">{product.name}</h1>

            {avgRating && (
              <div className="sd-live-rating">
                <div className="sd-live-stars">{renderStars(Math.round(avgRating))}</div>
                <span className="sd-live-avg">{avgRating}</span>
                <span className="sd-live-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <div className={`sd-stock-badge ${inStock ? 'sd-stock-badge--in' : 'sd-stock-badge--out'}`}>
              <span className="sd-stock-dot" />
              {inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            {/* Price Card */}
            <div className="sd-price-card">
              <div className="sd-price-columns">
                <div className="sd-price-block sd-price-block--sales">
                  <span className="sd-price-heading sd-price-heading--sales">
                    <FaTag className="sd-tag-icon" /> Sales Price
                  </span>
                  <span className="sd-price-value sd-price-value--sales">
                    ₹{salesPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                {mrpPrice > salesPrice && (
                  <>
                    <div className="sd-price-sep" />
                    <div className="sd-price-block sd-price-block--mrp">
                      <span className="sd-price-heading sd-price-heading--mrp">MRP Price</span>
                      <span className="sd-price-value sd-price-value--mrp">
                        ₹{mrpPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="sd-price-sep" />
                    <div className="sd-price-block sd-price-block--save">
                      <span className="sd-price-heading sd-price-heading--save">You Save</span>
                      <span className="sd-price-value sd-price-value--save">
                        ₹{savedAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {matchedVariant && (
                <div className="sd-variant-note">
                  <FaCheckCircle style={{ color: '#4caf50', fontSize: '11px' }} />
                  Price for: <strong>{matchedVariant.size}{matchedVariant.color && ` · ${matchedVariant.color}`}</strong>
                </div>
              )}
            </div>

            {/* Size */}
            {uniqueSizes.length > 0 && (
              <div className="sd-option-section">
                <div className="sd-option-header">
                  <span className="sd-option-title">Size</span>
                  {selectedSize && <span className="sd-selected-val">{selectedSize}</span>}
                </div>
                <div className="sd-size-grid">
                  {uniqueSizes.map((size, i) => (
                    <button key={i}
                      className={`sd-size-btn ${selectedSize === size ? 'sd-size-btn--active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {uniqueColors.length > 0 && (
              <div className="sd-option-section">
                <div className="sd-option-header">
                  <span className="sd-option-title">Color</span>
                  {selectedColor && <span className="sd-selected-val">{selectedColor}</span>}
                </div>
                <div className="sd-color-grid">
                  {uniqueColors.map((color, i) => {
                    const isActive = selectedColor === color;
                    return (
                      <button key={i}
                        className={`sd-color-btn ${isActive ? 'sd-color-btn--active' : ''}`}
                        onClick={() => setSelectedColor(color)} title={color}
                      >
                        <span className="sd-color-swatch" style={{ background: color.toLowerCase() }} />
                        <span className="sd-color-label">{color}</span>
                        {isActive && <FaCheckCircle className="sd-color-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.description && <p className="sd-description">{product.description}</p>}

            {/* Quantity */}
            {inStock && !itemAlreadyInCart && (
              <div className="sd-qty-row">
                <span className="sd-qty-label">Quantity</span>
                <div className="sd-qty-ctrl">
                  <button className="sd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                    <FaMinus />
                  </button>
                  <span className="sd-qty-val">{quantity}</span>
                  <button className="sd-qty-btn" onClick={() => setQuantity(q => Math.min(computedStock, q + 1))} disabled={quantity >= computedStock}>
                    <FaPlus />
                  </button>
                </div>
                <span className="sd-qty-note">Max {computedStock} units</span>
              </div>
            )}

            {/* Actions */}
            <div className="sd-actions">
              <button
                className={`sd-btn-cart ${itemAlreadyInCart ? 'sd-btn-cart--goto' : ''}`}
                onClick={handleCartAction}
                disabled={!inStock}
              >
                <FaShoppingCart />
                <span>{itemAlreadyInCart ? 'Go to Cart' : 'Add to Cart'}</span>
              </button>
              <button className="sd-btn-buy" onClick={handleBuyNow} disabled={!inStock}>
                <FaCreditCard /><span>Buy Now</span>
              </button>
              {/* Heart button — only active when inStock */}
              <button
                className={`sd-btn-wish ${isInWishlist ? 'sd-btn-wish--active' : ''}`}
                onClick={handleWishlist}
                disabled={!inStock}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <FaHeart />
              </button>
            </div>

            <div className="sd-delivery-note">
              <span>Free delivery on orders above ₹999</span>
              <span>Easy 7-day returns</span>
            </div>
          </div>
        </div>

        {/* ══ SIMILAR PRODUCTS ══ */}
        {!similarLoading && similarProducts.length > 0 && (
          <div className="sd-similar-section">
            <div className="sd-similar-header">
              <h2 className="sd-similar-title">
                Similar Products
                <span className="sd-similar-category">{product.category?.name}</span>
              </h2>
              <div className="sd-similar-bar"><span /></div>
            </div>

            <div className="sd-similar-grid">
              {similarProducts.map((sim) => {
                const simInStock   = getSimilarStock(sim);
                const simImageUrl  = sim.mainImage ? `${IMG_BASE}${sim.mainImage}` : '/assets/placeholder.png';
                const { sales: simSales, mrp: simMrp } = getSimilarDisplayPrices(sim);
                const simDisc      = simMrp > simSales && simMrp > 0 ? Math.round(((simMrp - simSales) / simMrp) * 100) : 0;
                const isWishlisted = !!wishlistItems?.some(w => w.id === sim.id);
                const isCarted     = !!cartItems?.some(c => c.id === sim.id);

                return (
                  <div key={sim.id} className="sd-sim-card">
                    <div className="sd-sim-img-wrap" onClick={() => goToSimilar(sim)} style={{ cursor: 'pointer' }}>
                      <img src={simImageUrl} alt={sim.name} className="sd-sim-img"
                        onError={e => { e.target.src = '/assets/placeholder.png'; }} />
                      {simDisc > 0 && <span className="sd-sim-discount-badge">{simDisc}% OFF</span>}
                      {!simInStock && <div className="sd-sim-oos-overlay">Out of Stock</div>}
                      <div className="sd-sim-hover-overlay">
                        <button className="sd-sim-hover-view" tabIndex={-1}>
                          <FaEye size={13} /> View
                        </button>
                      </div>
                    </div>

                    <div className="sd-sim-info">
                      <span className="sd-sim-name" onClick={() => goToSimilar(sim)} style={{ cursor: 'pointer' }}>
                        {sim.name}
                      </span>
                      <div className="sd-sim-stars">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} style={{ color: '#d1a309', fontSize: '11px' }} />
                        ))}
                      </div>
                      <div className="sd-sim-price-row">
                        <span className="sd-sim-sales">₹{simSales.toLocaleString('en-IN')}</span>
                        {simMrp > simSales && <span className="sd-sim-mrp">₹{simMrp.toLocaleString('en-IN')}</span>}
                      </div>

                      <div className="sd-sim-actions">
                        <button
                          className={`sd-sim-cart-btn ${isCarted ? 'sd-sim-cart-btn--goto' : ''} ${!simInStock ? 'sd-sim-cart-btn--oos' : ''}`}
                          disabled={!simInStock}
                          onClick={() => {
                            if (!simInStock) return;
                            if (isCarted) { navigate('/cart'); return; }
                            addToCart({ ...sim, price: simSales });
                            showCartAddedToast(sim.name);
                          }}
                        >
                          <FaShoppingCart size={11} />
                          <span>{!simInStock ? 'Out of Stock' : isCarted ? 'Go to Cart' : 'Add to Cart'}</span>
                        </button>

                        <button
                          className={`sd-sim-wish-btn ${isWishlisted ? 'sd-sim-wish-btn--active' : ''}`}
                          disabled={!simInStock}
                          onClick={() => {
                            if (!simInStock) return;
                            addToWishlist(sim);
                            if (isWishlisted) showWishlistRemovedToast(sim.name);
                            else showWishlistAddedToast(sim.name);
                          }}
                        >
                          <FaHeart size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ CUSTOMER REVIEWS ══ */}
        {!reviewsLoading && reviews.length > 0 && (
          <div className="sd-reviews-section">
            <div className="sd-reviews-header">
              <h2 className="sd-reviews-title">
                Customer Reviews
                <span className="sd-reviews-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </h2>
              {avgRating && (
                <div className="sd-avg-rating">
                  <span className="sd-avg-number">{avgRating}</span>
                  <div className="sd-avg-stars">{renderStars(Math.round(avgRating))}</div>
                  <span className="sd-avg-label">Avg Rating</span>
                </div>
              )}
            </div>
            <div className="sd-reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="sd-review-card">
                  <div className="sd-review-top">
                    <div className="sd-reviewer-info">
                      <FaUserCircle className="sd-reviewer-avatar" />
                      <div>
                        <p className="sd-reviewer-name">{review.customerInfo?.name || 'Anonymous'}</p>
                        <p className="sd-review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="sd-review-stars">{renderStars(Number(review.rating) || 5)}</div>
                  </div>
                  <p className="sd-review-text">{review.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopDetail;
