// FILE PATH: ars-admin/src/components/Sidebar.jsx
// ACTION   : REPLACE FULL FILE (added RiTruckFill icon + shipping nav item)

import React, { useState, useEffect } from 'react';
import {
  RiDashboardFill, RiShoppingBag3Fill, RiPriceTag3Fill,
  RiUser3Fill, RiImage2Fill, RiStarFill,
  RiStackFill, RiArrowDownSLine, RiLogoutBoxRFill,
  RiMailFill, RiBarChartGroupedFill, RiGiftFill, RiTicketFill,
  RiTimerFlashFill, RiTruckFill   // ← NEW: RiTruckFill added
} from "react-icons/ri";
import axios from 'axios';
import { toast } from 'react-toastify';
import './Sidebar.css';

import { API } from '../config';

const Sidebar = ({ setActivePage, activePage, setOrderStatus, orderStatus }) => {
  const [orderOpen,   setOrderOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const orderStatuses = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const r = await axios.get(`${API}/contact/unread-count`);
        setUnreadCount(r.data.unreadCount || 0);
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderClick = (status) => {
    setOrderStatus(status);
    setActivePage('orders');
  };

  const handleLogout = () => {
    toast.warn(
      <div style={{ lineHeight: 1.6 }}>
        <strong style={{ fontSize: 14 }}>Logout from Admin Panel?</strong>
        <p style={{ margin: '6px 0 10px', fontSize: 13, color: '#64748b' }}>
          You will be redirected to the login page.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              toast.dismiss();
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminId');
              localStorage.removeItem('adminName');
              delete axios.defaults.headers.common.Authorization;

              toast.success(' Logged out successfully!', {
                autoClose: 1500,
                onClose: () => { window.location.href = '/login'; },
              });
            }}
            style={{
              background: '#ef4444', color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px 16px', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
            }}
          >
            Yes, Logout
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              background: '#e2e8f0', color: '#475569', border: 'none',
              borderRadius: 6, padding: '6px 16px', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        icon: '🚪',
        position: 'top-center',
      }
    );
  };

  const navItem = (page, icon, label, badge = null) => (
    <div
      className={`nav-item ${activePage === page ? 'active' : ''}`}
      onClick={() => { setActivePage(page); setOrderOpen(false); }}
    >
      <div className="nav-left">{icon} {label}</div>
      {badge > 0 && <span className="unread-badge">{badge}</span>}
    </div>
  );

  return (
    <aside className="ars-sidebar">
      <div className="ars-logo-container">
        <span className="gold-text">ARS</span> FASHION
      </div>

      <nav className="ars-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItem('dashboard', <RiDashboardFill />, 'Dashboard')}

        {/* Orders with submenu */}
        <div
          className={`nav-item ${activePage === 'orders' ? 'active' : ''} ${orderOpen ? 'open-parent' : ''}`}
          onClick={() => {
            setOrderOpen(!orderOpen);
            if (!orderOpen && activePage !== 'orders') handleOrderClick('All');
          }}
        >
          <div className="nav-left"><RiShoppingBag3Fill /> Orders</div>
          <RiArrowDownSLine className={`arrow-icon ${orderOpen ? 'rotate' : ''}`} />
        </div>

        {orderOpen && (
          <div className="order-submenu">
            <div
              className={`sub-item ${activePage === 'orders' && orderStatus === 'All' ? 'sub-active' : ''}`}
              onClick={() => handleOrderClick('All')}
            >All Orders</div>
            {orderStatuses.map(s => (
              <div key={s}
                className={`sub-item ${activePage === 'orders' && orderStatus === s ? 'sub-active' : ''}`}
                onClick={() => handleOrderClick(s)}
              >{s}</div>
            ))}
          </div>
        )}

        <div className="nav-section-label">Inventory</div>
        {navItem('products',   <RiStackFill />,     'Products')}
        {navItem('categories', <RiPriceTag3Fill />, 'Categories')}

        <div className="nav-section-label">Media</div>
        {navItem('banner',       <RiImage2Fill />,     'Banners')}
        {navItem('offer-banner', <RiGiftFill />,       'Offer Banners')}
        {navItem('deal-of-day',  <RiTimerFlashFill />, 'Deal of Day')}

        <div className="nav-section-label">Marketing</div>
        {navItem('coupons',  <RiTicketFill />, 'Coupons')}
        {navItem('shipping', <RiTruckFill />,  'Shipping Rates')}  {/* ← NEW */}

        <div className="nav-section-label">User Management</div>
        {navItem('customers', <RiUser3Fill />,          'Customers')}
        {navItem('reviews',   <RiStarFill />,           'Reviews')}
        {navItem('inbox',     <RiMailFill />,            'Inbox', unreadCount)}
        {navItem('reports',   <RiBarChartGroupedFill />, 'Reports')}

        <div className="nav-section-label">System</div>
        <div className="nav-item logout-item" onClick={handleLogout}>
          <div className="nav-left"><RiLogoutBoxRFill className="logout-icon" /> Logout</div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;