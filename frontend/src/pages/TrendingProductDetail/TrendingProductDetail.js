import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import {
  FaHeart, FaShoppingCart, FaCreditCard,
  FaChevronLeft, FaMinus, FaPlus, FaTag,
  FaCheckCircle, FaStar
} from 'react-icons/fa';
import './TrendingProductDetail.css';
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';

import { API as _TDAPI } from '../../config';
const API_BASE_URL = _TDAPI.replace('/api', '');
const IMG_BASE = `${API_BASE_URL}/uploads/`;

/* ── Safe string helper: extracts .name if object, else returns string ── */
const safeStr = (val) => {
  if (!val) return '';
  if (typeof val === 'object') return val?.name || val?.title || '';
  return String(val);
};

const TrendingProductDetail = () => {
  const { state } = useLocation();
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();

  /* ─── States (ALL before early return) ─── */
  const [product,       setProduct]       = useState(state?.product || null);
  const [loading,       setLoading]       = useState(!state?.product);
  const [qty,           setQty]           = useState(1);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  /* ─── Fetch if not in state ─── */
  useEffect(() => {
    if (!state?.product && id) {
      axios.get(`${API_BASE_URL}/api/collections/trending/${id}`)
        .then(res => setProduct(res.data?.product || res.data))
        .catch(err => console.error('Failed to fetch product:', err))
        .finally(() => setLoading(false));
    }
  }, [id, state]);

  /* ─── Memoized variants ─── */
  const allVariants = useMemo(() => product?.variants || [], [product]);

  const uniqueSizes = useMemo(
    () => [...new Set(allVariants.map(v => safeStr(v.size)).filter(Boolean))],
    [allVariants]
  );

  const uniqueColors = useMemo(
    () => [...new Set(allVariants.map(v => safeStr(v.color)).filter(Boolean))],
    [allVariants]
  );

  const matchedVariant = useMemo(() => {
    if (!allVariants.length) return null;
    let v = allVariants.find(v => safeStr(v.size) === selectedSize && safeStr(v.color) === selectedColor);
    if (!v && selectedSize)  v = allVariants.find(v => safeStr(v.size) === selectedSize);
    if (!v && selectedColor) v = allVariants.find(v => safeStr(v.color) === selectedColor);
    return v || allVariants[0];
  }, [allVariants, selectedSize, selectedColor]);

  /* ─── Set defaults when product loads ─── */
  useEffect(() => {
    if (!product) return;
    if (product.variants?.length > 0) {
      const sizes  = [...new Set(product.variants.map(v => safeStr(v.size)).filter(Boolean))];
      const colors = [...new Set(product.variants.map(v => safeStr(v.color)).filter(Boolean))];
      if (sizes.length)  setSelectedSize(sizes[0]);
      if (colors.length) setSelectedColor(colors[0]);
    }
  }, [product]);

  /* ─── Early returns (after ALL hooks) ─── */
  if (loading) return (
    <div className="tpd-loader">
      <div className="tpd-spinner" />
      <span>Loading Product...</span>
    </div>
  );
  if (!product) return <div className="tpd-loader tpd-loader--error">Product Not Found</div>;

  /* ─── Safe field extractions (no objects in JSX) ─── */
  const productName     = safeStr(product.name);
  const categoryName    = safeStr(product.categories) || safeStr(product.category) || 'ARS FASHION HUB';
  const productDesc     = safeStr(product.description);
  const productTag      = safeStr(product.tag);
  const rating          = Number(product.rating) || 5;
  // Compute from variants if totalStock missing (collections API does not send it)
  const computedVariantStock = (product.variants && product.variants.length > 0)
    ? product.variants.reduce((sum, v) => sum + Number(v.quantity || 0), 0)
    : 0;
  const stockCount = Number(product.totalStock) || Number(product.stock) || computedVariantStock;
  const inStock         = stockCount > 0 || product.inStock === true;

  /* ─── Image URL ─── */
  const productImg = product.img || product.image
    ? String(product.img || product.image)
    : product.mainImage
      ? `${IMG_BASE}${product.mainImage}`
      : '/assets/placeholder.png';

  /* ─── Extra thumbnails (no mainImage duplicate) ─── */
  const extraThumbs = (product.thumbnails || []).filter(
    t => t.image && t.image !== product.mainImage
  );

  /* ─── Pricing ─── */
  const salesPrice = matchedVariant
    ? Number(matchedVariant.salesPrice)
    : Number(product.salesPrice) || Number(product.offerPrice) || Number(product.price) || 0;

  const mrpPrice = matchedVariant
    ? Number(matchedVariant.mrpPrice)
    : Number(product.mrpPrice) || Number(product.oldPrice) || salesPrice;

  const discount = mrpPrice > salesPrice && mrpPrice > 0
    ? Math.round(((mrpPrice - salesPrice) / mrpPrice) * 100)
    : 0;
  const savedAmount = mrpPrice > salesPrice ? mrpPrice - salesPrice : 0;

  /* ─── Cart / Wishlist status ─── */
  const isInWishlist      = wishlistItems?.some(i => i.id === product.id);
  const itemAlreadyInCart = cartItems?.some(i => i.id === product.id);

  /* ─── Variant display strings ─── */
  const variantSize  = matchedVariant ? safeStr(matchedVariant.size)  : '';
  const variantColor = matchedVariant ? safeStr(matchedVariant.color) : '';

  /* ─── Handlers ─── */
  const handleCartAction = () => {
    if (itemAlreadyInCart) {
      navigate('/cart');
    } else {
      addToCart({
        ...product,
        img: productImg,
        price: salesPrice,
        quantity: qty,
        selectedVariant: matchedVariant,
      });
      showCartAddedToast(productName);
    }
  };

  const handleWishlist = () => {
    addToWishlist({ ...product, img: productImg });
    if (isInWishlist) showWishlistRemovedToast(productName);
    else showWishlistAddedToast(productName);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    if (!itemAlreadyInCart) {
      addToCart({ ...product, img: productImg, price: salesPrice, quantity: qty, selectedVariant: matchedVariant });
    }
    navigate('/checkout');
  };

  return (
    <div className="tpd-wrapper">
      <div className="tpd-container">

        {/* Back */}
        <button className="tpd-back" onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back to Shop
        </button>

        <div className="tpd-layout">

          {/* ═══ LEFT: IMAGE ═══ */}
          <div className="tpd-images">
            <div className="tpd-img-box">

              {discount > 0 && (
                <div className="tpd-badge-wrap">
                  <span className="tpd-discount-badge">{discount}% OFF</span>
                  <span className="tpd-save-badge">Save ₹{savedAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {productTag ? (
                <span className="tpd-tag-badge">{productTag}</span>
              ) : (
                <span className="tpd-tag-badge">Trending</span>
              )}

              {!inStock && <span className="tpd-oos-badge">Out of Stock</span>}

              <img
                src={productImg}
                alt={productName}
                className="tpd-main-img"
                onError={e => { e.target.src = '/assets/placeholder.png'; }}
              />
            </div>

            {/* Thumbnails */}
            {extraThumbs.length > 0 && (
              <div className="tpd-thumbs">
                <div className="tpd-thumb-wrap tpd-thumb--active">
                  <img
                    src={productImg}
                    alt="main"
                    className="tpd-thumb"
                    onError={e => { e.target.src = '/assets/placeholder.png'; }}
                  />
                </div>
                {extraThumbs.map((t, idx) => {
                  const src = `${IMG_BASE}${t.image}`;
                  return (
                    <div key={t.id || idx} className="tpd-thumb-wrap">
                      <img
                        src={src}
                        alt={`view-${idx + 1}`}
                        className="tpd-thumb"
                        onError={e => { e.target.src = '/assets/placeholder.png'; }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ RIGHT: INFO ═══ */}
          <div className="tpd-info">

            {/* Brand */}
            <p className="tpd-brand">{categoryName}</p>

            {/* Title */}
            <h1 className="tpd-title">{productName}</h1>

            {/* Stars */}
            <div className="tpd-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={`tpd-star ${i < rating ? 'tpd-star--on' : 'tpd-star--off'}`} />
              ))}
              <span className="tpd-rating-text">({rating}.0 Rating)</span>
            </div>

            {/* Stock Badge */}
            <div className={`tpd-stock-badge ${inStock ? 'tpd-stock-badge--in' : 'tpd-stock-badge--out'}`}>
              <span className="tpd-stock-dot" />
              {inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            {/* ═══ PRICE CARD ═══ */}
            <div className="tpd-price-card">
              <div className="tpd-price-columns">

                <div className="tpd-price-block tpd-price-block--sales">
                  <span className="tpd-price-heading tpd-price-heading--sales">
                    <FaTag className="tpd-tag-icon" /> Sales Price
                  </span>
                  <span className="tpd-price-value tpd-price-value--sales">
                    ₹{salesPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {mrpPrice > salesPrice && (
                  <>
                    <div className="tpd-price-sep" />
                    <div className="tpd-price-block tpd-price-block--mrp">
                      <span className="tpd-price-heading tpd-price-heading--mrp">MRP Price</span>
                      <span className="tpd-price-value tpd-price-value--mrp">
                        ₹{mrpPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="tpd-price-sep" />
                    <div className="tpd-price-block tpd-price-block--save">
                      <span className="tpd-price-heading tpd-price-heading--save">You Save</span>
                      <span className="tpd-price-value tpd-price-value--save">
                        ₹{savedAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {matchedVariant && (variantSize || variantColor) && (
                <div className="tpd-variant-note">
                  <FaCheckCircle style={{ color: '#4caf50', fontSize: '11px' }} />
                  Price for:{' '}
                  <strong>
                    {variantSize}
                    {variantSize && variantColor ? ` · ${variantColor}` : variantColor}
                  </strong>
                </div>
              )}
            </div>

            {/* ═══ SIZE SELECTOR ═══ */}
            {uniqueSizes.length > 0 && (
              <div className="tpd-option-section">
                <div className="tpd-option-header">
                  <span className="tpd-option-title">Size</span>
                  {selectedSize && <span className="tpd-selected-val">{selectedSize}</span>}
                </div>
                <div className="tpd-size-grid">
                  {uniqueSizes.map((size, i) => (
                    <button
                      key={i}
                      className={`tpd-size-btn ${selectedSize === size ? 'tpd-size-btn--active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ COLOR SELECTOR ═══ */}
            {uniqueColors.length > 0 && (
              <div className="tpd-option-section">
                <div className="tpd-option-header">
                  <span className="tpd-option-title">Color</span>
                  {selectedColor && <span className="tpd-selected-val">{selectedColor}</span>}
                </div>
                <div className="tpd-color-grid">
                  {uniqueColors.map((color, i) => {
                    const isActive = selectedColor === color;
                    return (
                      <button
                        key={i}
                        className={`tpd-color-btn ${isActive ? 'tpd-color-btn--active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                      >
                        <span
                          className="tpd-color-swatch"
                          style={{ background: color.toLowerCase() }}
                        />
                        <span className="tpd-color-label">{color}</span>
                        {isActive && <FaCheckCircle className="tpd-color-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {productDesc && <p className="tpd-description">{productDesc}</p>}

            {/* ═══ QUANTITY ═══ */}
            {inStock && !itemAlreadyInCart && (
              <div className="tpd-qty-row">
                <span className="tpd-qty-label">Quantity</span>
                <div className="tpd-qty-ctrl">
                  <button
                    className="tpd-qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    <FaMinus />
                  </button>
                  <span className="tpd-qty-val">{qty}</span>
                  <button
                    className="tpd-qty-btn"
                    onClick={() => setQty(q => stockCount > 0 ? Math.min(stockCount, q + 1) : q + 1)}
                    disabled={stockCount > 0 && qty >= stockCount}
                  >
                    <FaPlus />
                  </button>
                </div>
                {stockCount > 0 && (
                  <span className="tpd-qty-note">Max {stockCount} units</span>
                )}
              </div>
            )}

            {/* ═══ ACTION BUTTONS ═══ */}
            <div className="tpd-actions">
              <button
                className={`tpd-btn-cart ${itemAlreadyInCart ? 'tpd-btn-cart--goto' : ''}`}
                onClick={handleCartAction}
                disabled={!inStock}
              >
                <FaShoppingCart />
                <span>{itemAlreadyInCart ? 'Go to Cart' : 'Add to Cart'}</span>
              </button>

              <button className="tpd-btn-buy" onClick={handleBuyNow} disabled={!inStock}>
                <FaCreditCard />
                <span>Buy Now</span>
              </button>

              <button
                className={`tpd-btn-wish ${isInWishlist ? 'tpd-btn-wish--active' : ''} ${!inStock ? 'tpd-btn-wish--disabled' : ''}`}
                onClick={inStock ? handleWishlist : undefined}
                disabled={!inStock}
                title={!inStock ? 'Out of Stock — cannot wishlist' : isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              >
                <FaHeart />
              </button>
            </div>

            {/* Delivery note */}
            <div className="tpd-delivery-note">
              <span> Free delivery on orders above ₹999</span>
              <span> Easy 7-day returns</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingProductDetail;
