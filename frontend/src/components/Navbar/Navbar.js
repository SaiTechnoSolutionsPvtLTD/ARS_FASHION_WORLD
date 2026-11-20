import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Heart, ShoppingBag, ChevronDown, Search, X, Menu, LogOut, Package, UserCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCategories } from '../../context/CategoryContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const COLUMN_SIZE = 5;

const Navbar = () => {
  const [profileOpen, setProfileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [scrolled, setScrolled]           = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  const { totalQuantity }                       = useCart();
  const { categories, loading: catLoading, toSlug } = useCategories();
  const { customer, isLoggedIn, token, logout } = useAuth();

  // ── Scroll effect ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close profile dropdown on outside click ──
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Fetch recent orders when profile opens ──
  useEffect(() => {
    if (profileOpen && isLoggedIn && customer?.id) {
      setOrdersLoading(true);
      fetch(`${process.env.REACT_APP_API_URL}/orders/customer/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          // show only latest 3 orders
          setOrders(Array.isArray(data) ? data.slice(0, 3) : []);
        })
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [profileOpen, isLoggedIn, customer?.id, token]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setOrders([]);
    navigate('/');
  };

  // ── Check if link is active ──
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // ── Order status color ──
  const statusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered')  return '#2e7d32';
    if (s === 'cancelled')  return '#c62828';
    if (s === 'processing') return '#e65100';
    if (s === 'shipped')    return '#1565c0';
    return '#555';
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">

        {/* Mobile toggle */}
        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
        </div>

        <div className="nav-left">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src="/assets/logo.png" alt="ARS Logo" className="logo" />
          </Link>
        </div>

        {/* Center nav */}
        <ul className={`nav-center ${mobileMenuOpen ? 'mobile-nav-active' : ''}`}>
          <li><Link to="/" className={`nav-main-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/shop" className={`nav-main-link ${isActive('/shop') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Shop</Link></li>

          <li className={`collection-item ${isActive('/collections') ? 'active' : ''}`}>
            <div className="nav-main-link flex-link">
              Collection <ChevronDown size={14} className="arrow-icon" />
            </div>
            <div className="mega-menu-box">
              <div className="mega-menu-inner">
                {catLoading ? (
                  <p className="loading-text">Loading…</p>
                ) : (
                  categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/collections/${toSlug(cat.name)}`}
                      className="mobile-sub-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </li>

          <li><Link to="/contact" className={`nav-main-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
        </ul>

        {/* Right icons */}
        <div className="nav-right">

          {/* Search */}
          <div className="search-wrapper">
            <Search
              className={`icon ${searchOpen ? 'active-icon' : ''}`}
              size={22}
              onClick={() => { setSearchOpen(!searchOpen); setProfileOpen(false); }}
            />
            {searchOpen && (
              <div className="search-dropdown-box animate-pop-in">
                <div className="search-input-container">
                  <Search size={18} className="search-inner-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  />
                  <X size={18} className="close-search-btn" onClick={() => setSearchOpen(false)} />
                </div>
              </div>
            )}
          </div>

          <Link to="/wishlist" className="wishlist-link icon"><Heart size={22} /></Link>

          <Link to="/cart" className="cart-container icon">
            <ShoppingBag size={22} />
            {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
          </Link>

          <button className="nav-enquire-btn desktop-only" onClick={() => navigate('/contact')}>
            Enquire
          </button>

          {/* ── Profile Dropdown ── */}
          <div className="profile-wrapper" ref={profileRef}>
            <User
              className={`icon ${profileOpen ? 'active-icon' : ''}`}
              size={22}
              onClick={() => { setProfileOpen(!profileOpen); setSearchOpen(false); }}
            />

            {profileOpen && (
              <div className="profile-menu animate-pop-in">

                {isLoggedIn && customer ? (
                  <>
                    {/* ── Logged In Header ── */}
                    <div className="profile-header logged-in">
                      <div className="profile-avatar">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="profile-info">
                        <p className="profile-name">{customer.name}</p>
                        <p className="profile-email">{customer.email}</p>
                      </div>
                    </div>

                    {/* ── Quick Links ── */}
                    <div className="profile-links">
                      <Link to="/my-account" onClick={() => setProfileOpen(false)}>
                        <UserCircle size={14} /> My Account
                      </Link>
                      <Link to="/my-orders" onClick={() => setProfileOpen(false)}>
                        <Package size={14} /> My Orders
                      </Link>
                    </div>

                    {/* ── Recent Orders ── */}
                    <div className="profile-orders-section">
                      <p className="profile-orders-title">Recent Orders</p>

                      {ordersLoading ? (
                        <div className="profile-orders-loading">
                          <span className="order-spinner" />
                          Loading…
                        </div>
                      ) : orders.length === 0 ? (
                        <p className="profile-no-orders">No orders yet</p>
                      ) : (
                        orders.map(order => (
                          <div
                            key={order.id}
                            className="profile-order-card"
                            onClick={() => { navigate('/my-orders'); setProfileOpen(false); }}
                          >
                            <div className="profile-order-top">
                              <span className="profile-order-id">#{order.id}</span>
                              <span
                                className="profile-order-status"
                                style={{ color: statusColor(order.status) }}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="profile-order-bottom">
                              <span className="profile-order-amount">
                                ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                              </span>
                              <span className="profile-order-date">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}

                      {orders.length > 0 && (
                        <button
                          className="profile-view-all-btn"
                          onClick={() => { navigate('/my-orders'); setProfileOpen(false); }}
                        >
                          View All Orders →
                        </button>
                      )}
                    </div>

                    {/* ── Logout ── */}
                    <button className="profile-logout-btn" onClick={handleLogout}>
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* ── Guest ── */}
                    <div className="profile-header">
                      <p>Welcome</p>
                    </div>
                    <div className="profile-links">
                      <Link to="/login"    onClick={() => setProfileOpen(false)}>Login</Link>
                      <Link to="/register" onClick={() => setProfileOpen(false)}>Register</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;