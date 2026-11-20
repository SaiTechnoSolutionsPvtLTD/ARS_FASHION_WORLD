// src/pages/Shop/Shop.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCategories, API_BASE_URL } from '../../context/CategoryContext';
import { FaHeart, FaEye } from 'react-icons/fa';
import './Shop.css';
import { toProductSlug } from '../../utils/slug';
import { showCartAddedToast, showWishlistAddedToast, showWishlistRemovedToast } from '../../utils/toast';

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();
  const { categories, loading: catLoading } = useCategories();

  const [allProducts, setAllProducts] = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'All';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  });
  const [sortType, setSortType] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat    = params.get('category');
    const search = params.get('search');
    if (cat)    setSelectedCategory(cat);
    if (search) setSearchQuery(search);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/all`);
        setAllProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.name === selectedCategory);
    }

    if (searchQuery.trim()) {
      const words = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter(p => {
        const haystack = [p.name, p.category?.name, p.description]
          .filter(Boolean).join(' ').toLowerCase();
        return words.every(word => haystack.includes(word));
      });
    }

    if (minPrice !== '') result = result.filter(p => getActivePrice(p) >= Number(minPrice));
    if (maxPrice !== '') result = result.filter(p => getActivePrice(p) <= Number(maxPrice));

    if (sortType === 'lowToHigh') result.sort((a, b) => getActivePrice(a) - getActivePrice(b));
    else if (sortType === 'highToLow') result.sort((a, b) => getActivePrice(b) - getActivePrice(a));

    setFiltered(result);
  }, [selectedCategory, searchQuery, sortType, allProducts, minPrice, maxPrice]);

  const getActivePrice = (product) => {
    if (product.variants?.length > 0) return Number(product.variants[0].salesPrice) || 0;
    return Number(product.salesPrice) || 0;
  };
  const getMrpPrice = (product) => {
    if (product.variants?.length > 0) return Number(product.variants[0].mrpPrice) || 0;
    return Number(product.mrpPrice) || 0;
  };

  //  Centralized stock check — covers both variant and totalStock
  const getInStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      const variantStock = product.variants.reduce((s, v) => s + Number(v.quantity || 0), 0);
      return variantStock > 0;
    }
    return Number(product.totalStock) > 0;
  };

  const isInCart     = (id) => cartItems?.some(item => item.id === id);
  const isInWishlist = (id) => wishlistItems?.some(item => item.id === id);
  const formatPrice  = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  //  Cart — hard blocked when out of stock
  const handleAddToCart = (product, activePrice) => {
    if (!getInStock(product)) return; // Hard block — no action, no toast

    if (!isInCart(product.id)) {
      addToCart({ ...product, price: activePrice });
      showCartAddedToast(product.name);
    } else {
      navigate('/cart');
    }
  };

  //  Wishlist toggle — add if not present, remove if already in wishlist
  const handleAddToWishlist = (product) => {
    if (!getInStock(product)) return; // Hard block — no action, no toast

    const alreadyInWishlist = isInWishlist(product.id);
    addToWishlist(product);

    if (!alreadyInWishlist) {
      showWishlistAddedToast(product.name);
    } else {
      showWishlistRemovedToast(product.name);
    }
  };

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortType('default');
  };

  const sidebarCategories = ['All', ...categories.map(c => c.name)];

  useEffect(() => {
    if (!catLoading && selectedCategory !== 'All' && !categories.some(c => c.name === selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, catLoading, selectedCategory]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Collection...</span>
      </div>
    );
  }

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery || minPrice || maxPrice;

  return (
    <div className="shop-page">
      <div className="shop-banner">
        <h1>
          {searchQuery
            ? `Results for "${searchQuery}"`
            : selectedCategory === 'All'
              ? 'Our Collection'
              : `${selectedCategory} Collection`}
        </h1>
        <p className="shop-banner-sub">Discover our exclusive range of fashion</p>
      </div>

      <div className="shop-container">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">

          <div className="sidebar-box">
            <h3 className="sidebar-title">Search</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 32px 8px 10px',
                  border: '1px solid #ddd', borderRadius: 6,
                  fontSize: 13, boxSizing: 'border-box', outline: 'none',
                }}
              />
              {searchQuery && (
                <span
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer', fontSize: 16, color: '#999',
                  }}
                >×</span>
              )}
            </div>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-title">Categories</h3>
            <ul className="category-list">
              {sidebarCategories.map(cat => (
                <li
                  key={cat}
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className="cat-dot" />
                  {cat}
                  {cat !== 'All' && (
                    <span className="cat-count">
                      {allProducts.filter(p => p.category?.name === cat).length}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-title">Price Filter</h3>
            <div className="price-filter-wrap">
              <div className="price-field">
                <label>Min Price</label>
                <div className="price-input-wrap">
                  <span className="rupee-sym">₹</span>
                  <input type="text" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                </div>
              </div>
              <div className="price-field">
                <label>Max Price</label>
                <div className="price-input-wrap">
                  <span className="rupee-sym">₹</span>
                  <input type="text" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>
              {(minPrice || maxPrice) && (
                <button className="clear-filter-btn" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                  ✕ Clear Filter
                </button>
              )}
            </div>
          </div>

        </aside>

        {/* ── MAIN GRID ── */}
        <main className="main-content">
          <div className="top-filter-bar">
            <span className="results-count">
              Showing <strong>{filtered.length}</strong> products
              {searchQuery && <em> for "{searchQuery}"</em>}
              {!searchQuery && selectedCategory !== 'All' && <em> in {selectedCategory}</em>}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  style={{
                    background: 'transparent', border: '1px solid #ccc',
                    borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
                    fontSize: 13, color: '#666',
                  }}
                >
                  ✕ Reset All
                </button>
              )}
              <select className="sort-select" onChange={e => setSortType(e.target.value)} value={sortType}>
                <option value="default">Default Sorting</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🛍️</div>
              <h3>No products found</h3>
              <p>{searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}</p>
              <button onClick={resetAllFilters}>Reset All Filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(product => {
                const activePrice   = getActivePrice(product);
                const originalPrice = getMrpPrice(product);
                const hasDiscount   = originalPrice > activePrice && originalPrice > 0;
                const discountPct   = hasDiscount
                  ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;
                const imageUrl = product.mainImage
                  ? `${API_BASE_URL}/uploads/${product.mainImage}` : '/assets/placeholder.png';

                // Centralized stock check
                const inStock = getInStock(product);

                return (
                  <div key={product.id} className="product-card">
                    <div
                      className="image-container"
                      onClick={() => navigate(`/shop/${toProductSlug(product)}`, { state: { product } })}
                    >
                      {hasDiscount && <span className="discount-badge">-{discountPct}%</span>}
                      {!inStock   && <span className="out-of-stock-badge">Out of Stock</span>}
                      <img
                        src={imageUrl} alt={product.name} className="product-img"
                        onError={e => { e.target.src = '/assets/placeholder.png'; }}
                      />
                      <div className="bottom-hover-bar" onClick={e => e.stopPropagation()}>
                        {/*  Wishlist — disabled + pointer-events blocked when out of stock */}
                        <button
                          className={`bar-icon heart ${isInWishlist(product.id) && inStock ? 'active' : ''} ${!inStock ? 'disabled-action' : ''}`}
                          onClick={() => handleAddToWishlist(product)}
                          disabled={!inStock}
                          title={!inStock ? 'Out of Stock — cannot wishlist' : isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          style={{ cursor: !inStock ? 'not-allowed' : 'pointer', opacity: !inStock ? 0.4 : 1 }}
                        >
                          <FaHeart />
                        </button>

                        {/*  Cart — disabled + no action when out of stock */}
                        <button
                          className={`bar-select-btn ${isInCart(product.id) && inStock ? 'go-to-cart-btn' : ''} ${!inStock ? 'out' : ''}`}
                          onClick={() => handleAddToCart(product, activePrice)}
                          disabled={!inStock}
                          style={{ cursor: !inStock ? 'not-allowed' : 'pointer' }}
                        >
                          {!inStock
                            ? 'OUT OF STOCK'
                            : isInCart(product.id)
                              ? 'GO TO CART'
                              : 'ADD TO CART'}
                        </button>

                        <button
                          className="bar-icon eye"
                          onClick={() => navigate(`/shop/${toProductSlug(product)}`, { state: { product } })}
                          title="Quick View"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>

                    <div
                      className="info-box"
                      onClick={() => navigate(`/shop/${toProductSlug(product)}`, { state: { product } })}
                    >
                      <span className="cat-text">{product.category?.name}</span>
                      <h4 className="name-text">{product.name}</h4>
                      <div className="shop-price-wrapper">
                        <p className="price-text" style={{ color: hasDiscount ? '#d32f2f' : '#00044a' }}>
                          {formatPrice(activePrice)}
                        </p>
                        {hasDiscount && <span className="old-price-text">{formatPrice(originalPrice)}</span>}
                      </div>
                      {hasDiscount && (
                        <span className="you-save-tag">Save {formatPrice(originalPrice - activePrice)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
