import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { FaHeart, FaEye } from 'react-icons/fa';
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';

import 'swiper/css';
import 'swiper/css/pagination';
import './TrendingProducts.css';
import { toProductSlug } from '../../utils/slug';

import { API as _TPAPI, IMG as IMAGE_BASE_URL } from '../../config';
const API_BASE_URL = `${_TPAPI}/collections/trending`;

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_BASE_URL);
        setProducts(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const getInStock = (product) => {
    const variantStock = product.variants?.length > 0
      ? product.variants.reduce((s, v) => s + Number(v.quantity || 0), 0)
      : null;
    return variantStock !== null ? variantStock > 0 : Number(product.totalStock) > 0;
  };

  const isInCart     = (id) => cartItems?.some(i => i.id === id);
  const isInWishlist = (id) => wishlistItems?.some(i => i.id === id);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!getInStock(product)) return;
    if (isInCart(product.id)) {
      navigate('/cart');
    } else {
      addToCart(product, 1);
      showCartAddedToast(product.name);
    }
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    if (!getInStock(product)) return;
    const alreadyPresent = isInWishlist(product.id);
    addToWishlist(product);
    alreadyPresent
      ? showWishlistRemovedToast(product.name)
      : showWishlistAddedToast(product.name);
  };

  const handleView = (product) => {
    navigate(`/shop/${toProductSlug(product)}`, { state: { product } });
  };

  if (loading) return (
    <div className="tp-loader">
      <div className="tp-spinner" />
      <span>Loading Trending...</span>
    </div>
  );

  if (products.length === 0) return null;

  return (
    <section className="tp-section">
      <div className="tp-wrapper">

        {/* ── Header ── */}
        <div className="tp-header">
          <h2 className="tp-title">Trending Products</h2>
          <p className="tp-subtitle">Handpicked styles loved by our customers</p>
          <div className="tp-title-bar"><span /></div>
        </div>

        {/* ── Swiper ── */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={16}
          slidesPerView={2}
          autoplay={{
            delay: 2800,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          loop={true}
          speed={600}
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            480:  { slidesPerView: 2,  spaceBetween: 12 },
            600:  { slidesPerView: 3,  spaceBetween: 14 },
            768:  { slidesPerView: 3,  spaceBetween: 16 },
            992:  { slidesPerView: 4,  spaceBetween: 18 },
            1200: { slidesPerView: 5,  spaceBetween: 18 },
            1400: { slidesPerView: 5,  spaceBetween: 20 },
            1600: { slidesPerView: 6,  spaceBetween: 20 },
          }}
          className="tp-swiper"
        >
          {products.map((item) => {
            const product = item.product;
            if (!product) return null;

            const inStock     = getInStock(product);
            const inWishlist  = isInWishlist(product.id);
            const inCart      = isInCart(product.id);
            const salesPrice  = Number(product.salesPrice) || 0;
            const mrpPrice    = Number(product.mrpPrice)   || 0;
            const hasDiscount = mrpPrice > salesPrice && mrpPrice > 0;
            const discountPct = hasDiscount ? Math.round(((mrpPrice - salesPrice) / mrpPrice) * 100) : 0;
            const saveAmount  = hasDiscount ? mrpPrice - salesPrice : 0;

            return (
              <SwiperSlide key={product.id}>
                <div
                  className={`tp-card ${!inStock ? 'tp-card-oos' : ''}`}
                  onClick={() => handleView(product)}
                >
                  {/* ── Image ── */}
                  <div className="tp-img-wrap">
                    <div className="tp-badges">
                      {hasDiscount && (
                        <span className="tp-tag-discount">-{discountPct}%</span>
                      )}
                    </div>

                    {!inStock && (
                      <div className="tp-oos-overlay"><span>Out of Stock</span></div>
                    )}

                    <img
                      src={`${IMAGE_BASE_URL}/${product.mainImage}`}
                      alt={product.name}
                      className="tp-img"
                      onError={e => { e.target.src = '/assets/placeholder.png'; }}
                    />

                    {/* ── Action Bar: heart | ADD TO CART | eye ── */}
                    <div className="tp-action-bar">
                      <button
                        className={`tp-action-btn tp-action-btn-icon ${inWishlist && inStock ? 'tp-btn-wish-active' : ''} ${!inStock ? 'tp-btn-disabled' : ''}`}
                        onClick={(e) => handleWishlist(e, product)}
                        disabled={!inStock}
                        title={inWishlist ? 'Wishlisted' : 'Wishlist'}
                      >
                        <FaHeart />
                      </button>

                      <button
                        className={`tp-action-btn tp-action-btn-cart ${inCart && inStock ? 'tp-btn-cart-active' : ''} ${!inStock ? 'tp-btn-disabled' : ''}`}
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={!inStock}
                      >
                        {inCart && inStock ? 'GO TO CART' : 'ADD TO CART'}
                      </button>

                      <button
                        className="tp-action-btn tp-action-btn-icon"
                        onClick={(e) => { e.stopPropagation(); handleView(product); }}
                        title="Quick View"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  {/* ── Info ── */}
                  <div className="tp-info">
                    <p className="tp-category">{product.category?.name || 'Fashion'}</p>
                    <h3 className="tp-name">{product.name}</h3>
                    <div className="tp-price-block">
                      <span className="tp-sales-price">₹{salesPrice.toLocaleString('en-IN')}</span>
                      {hasDiscount && (
                        <span className="tp-mrp-price">₹{mrpPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="tp-save-badge">
                        Save ₹{saveAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

      </div>
    </section>
  );
};

export default TrendingProducts;