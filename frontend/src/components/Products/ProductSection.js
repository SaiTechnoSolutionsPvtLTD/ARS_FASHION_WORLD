import React, { useState, useEffect } from 'react';
import { Heart, Eye, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; 
import axios from 'axios'; 
import './ProductSection.css';
import { toProductSlug } from '../../utils/slug';
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';

import { API as _PSAPI, IMG as IMAGE_BASE_URL } from '../../config';
const API_BASE_URL = `${_PSAPI}/collections`;

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState('new-arrivals'); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addToWishlist, wishlistItems, addToCart, cartItems } = useCart();

  const tabs = [
    { name: "New Arrivals", slug: "new-arrivals" },
    { name: "Best Sellers", slug: "best-sellers" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/${activeTab}`);
        setProducts(res.data); 
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  const getInStock = (product) => {
    const variantStock = product.variants && product.variants.length > 0
      ? product.variants.reduce((s, v) => s + Number(v.quantity || 0), 0)
      : null;
    return variantStock !== null
      ? variantStock > 0
      : Number(product.totalStock) > 0;
  };

  const isInCart = (id) => cartItems?.some(item => item.id === id);

  const handleWishlist = (e, product) => {
    e.preventDefault();
    if (!getInStock(product)) return;

    const isPresent = wishlistItems?.some(item => item.id === product.id);
    addToWishlist(product);

    if (!isPresent) {
      showWishlistAddedToast(product.name);
    } else {
      showWishlistRemovedToast(product.name);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (!getInStock(product)) return;

    if (isInCart(product.id)) {
      navigate('/cart');
    } else {
      addToCart(product);
      showCartAddedToast(product.name);
    }
  };

  return (
    <>
      <section className="trending-section">
        <div className="container-wrapper">
          <div className="section-header-left">
            <h2 className="trending-title">Most Popular Products</h2>
            <div className="trending-tabs">
              {tabs.map((tab) => (
                <button 
                  key={tab.slug} 
                  className={`tab-item ${activeTab === tab.slug ? 'active' : ''}`} 
                  onClick={() => setActiveTab(tab.slug)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loader-container">Loading Products...</div>
          ) : (
            <div className="trending-grid-four">
              {products.length > 0 ? products.map((item) => {
                const product = item.product; 
                if (!product) return null;

                const isInWishlist     = wishlistItems?.some(w => w.id === product.id);
                const itemAlreadyInCart = isInCart(product.id);
                const productInStock   = getInStock(product);

                const imageUrl = product.mainImage
                  ? `${IMAGE_BASE_URL}/${product.mainImage}`
                  : '/assets/img/placeholder.png';

                return (
                  <div key={product.id} className="trending-card">
                    <div className="image-box">
                      <Link to={`/shop/${toProductSlug(product)}`} state={{ product }} className="product-img-link">
                        <img src={imageUrl} alt={product.name} />
                        {!productInStock && (
                          <div className="out-of-stock-overlay">Out of Stock</div>
                        )}
                      </Link>

                      <div className="hover-actions-edge">
                        <button
                          className={`icon-btn-edge ${isInWishlist ? 'active-wish' : ''} ${!productInStock ? 'disabled-wish' : ''}`}
                          onClick={(e) => handleWishlist(e, product)}
                          disabled={!productInStock}
                          title={!productInStock ? 'Out of Stock' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          style={{ cursor: !productInStock ? 'not-allowed' : 'pointer', opacity: !productInStock ? 0.4 : 1 }}
                        >
                          <Heart
                            size={16}
                            fill={isInWishlist && productInStock ? "#ff4d4d" : "none"}
                            color={isInWishlist && productInStock ? "#ff4d4d" : "currentColor"}
                          />
                        </button>

                        <button
                          className={`main-action-edge ${itemAlreadyInCart && productInStock ? 'go-to-cart-highlight' : ''} ${!productInStock ? 'out-of-stock' : ''}`}
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={!productInStock}
                          style={{ cursor: !productInStock ? 'not-allowed' : 'pointer', opacity: !productInStock ? 0.5 : 1 }}
                        >
                          {!productInStock
                            ? 'Out Of Stock'
                            : itemAlreadyInCart
                              ? 'Go to Cart'
                              : 'Add to Cart'}
                        </button>

                        <Link to={`/shop/${toProductSlug(product)}`} state={{ product }} className="icon-btn-edge">
                          <Eye size={16} />
                        </Link>
                      </div>
                    </div>

                    <div className="content-box">
                      <p className="p-name">{product.name}</p>
                      <div className="p-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < 5 ? "#d1a309" : "none"} color="#d1a309" />
                        ))}
                      </div>
                      <div className="p-price">
                        <span className="curr">₹{product.salesPrice}</span>
                        {product.mrpPrice && <span className="old">₹{product.mrpPrice}</span>}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <p className="no-products">No products found in this collection.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductSection;
