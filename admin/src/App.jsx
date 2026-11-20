// FILE PATH: ars-admin/src/App.jsx
// ACTION   : REPLACE FULL FILE (added ShippingPage import + case)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar         from './components/Sidebar';
import Navbar          from './components/Navbar';
import Dashboard       from './pages/Dashboard';
import ProductPage     from './pages/ProductPage';
import OrderPage       from './pages/OrderPage';
import CategoryPage    from './pages/Category';
import CustomerPage    from './pages/CustomerPage';
import Login           from './pages/Login';
import ProtectedRoute  from './ProtectedRoute';
import ReviewPage      from './pages/ReviewPage';
import BannerPage      from './pages/BannerPage';
import InboxPage       from './pages/InboxPage';
import OfferBannerPage from './pages/OfferBannerPage';
import ManageDeals     from './pages/ManageDeals';
import Coupons         from './pages/Coupons';
import Reports         from './pages/Reports';
import ShippingPage    from './pages/ShippingPage';   // ← NEW
import './App.css';

const AdminLayout = ({ orderStatus, setOrderStatus, todayFilter, setTodayFilter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegment = location.pathname.replace('/dashboard', '').replace('/', '') || 'dashboard';
  const activePage  = pathSegment || 'dashboard';

  const setActivePage = (page) => {
    navigate(page === 'dashboard' ? '/dashboard' : `/dashboard/${page}`);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard />;
      case 'products':     return <ProductPage />;
      case 'categories':   return <CategoryPage />;
      case 'orders':       return <OrderPage orderStatusFilter={orderStatus} setActivePage={setActivePage} todayFilter={todayFilter} setTodayFilter={setTodayFilter} />;
      case 'customers':    return <CustomerPage />;
      case 'reviews':      return <ReviewPage />;
      case 'banner':       return <BannerPage />;
      case 'offer-banner': return <OfferBannerPage />;
      case 'deal-of-day':  return <ManageDeals />;
      case 'inbox':        return <InboxPage />;
      case 'coupons':      return <Coupons />;
      case 'reports':      return <Reports />;
      case 'shipping':     return <ShippingPage />;   // ← NEW
      default:             return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        setActivePage={setActivePage}
        activePage={activePage}
        setOrderStatus={setOrderStatus}
        orderStatus={orderStatus}
      />
      <div className="main-content">
        <Navbar setActivePage={setActivePage} />
        <div className="page-body">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [orderStatus, setOrderStatus] = useState('All');
  const [todayFilter, setTodayFilter] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/"      element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout orderStatus={orderStatus} setOrderStatus={setOrderStatus} todayFilter={todayFilter} setTodayFilter={setTodayFilter} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:page"
          element={
            <ProtectedRoute>
              <AdminLayout orderStatus={orderStatus} setOrderStatus={setOrderStatus} todayFilter={todayFilter} setTodayFilter={setTodayFilter} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;