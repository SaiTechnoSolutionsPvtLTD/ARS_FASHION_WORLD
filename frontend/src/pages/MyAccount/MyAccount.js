import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  MdDashboard, MdPerson, MdShoppingBag, MdLocationOn,
  MdSettings, MdLock, MdDeleteForever, MdLogout,
  MdFavorite, MdEdit, MdAdd, MdClose, MdSave,
  MdEmail, MdPhone, MdCalendarToday, MdWarning,
  MdChevronRight,
  MdShoppingCart, MdVisibility,
} from 'react-icons/md';
import './MyAccount.css';
import { toProductSlug } from '../../utils/slug';
import { showCartAddedToast, showOutOfStockToast, showWishlistRemovedToast } from '../../utils/toast';

import { API, IMG } from '../../config';


const SECTIONS = [
  { id: 'dashboard',  label: 'Dashboard',        Icon: MdDashboard },
  { id: 'profile',    label: 'My Profile',        Icon: MdPerson },
  { id: 'orders',     label: 'My Orders',         Icon: MdShoppingBag },
  { id: 'wishlist',   label: 'My Wishlist',       Icon: MdFavorite },
  { id: 'delivery',   label: 'Delivery Address',  Icon: MdLocationOn },
  { id: 'settings',   label: 'Account Settings',  Icon: MdSettings },
  { id: 'password',   label: 'Reset Password',    Icon: MdLock },
  { id: 'delete',     label: 'Delete Account',    Icon: MdDeleteForever, danger: true },
  { id: 'logout',     label: 'Logout',            Icon: MdLogout, danger: true },
];

const emptyAddr = { houseNo: '', street: '', city: '', state: '', pincode: '', country: 'India' };

// ─── Reusable inline toast confirm UI ───────────────────────────────────────
const ToastConfirm = ({ message, onConfirm, closeToast }) => (
  <div>
    <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{message}</p>
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => { closeToast(); onConfirm(); }}
        style={{
          background: '#e53935', color: '#fff', border: 'none',
          borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 600,
        }}
      >
        Yes, Delete
      </button>
      <button
        onClick={closeToast}
        style={{
          background: '#eee', color: '#333', border: 'none',
          borderRadius: 6, padding: '6px 16px', cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);

const confirmToast = (message, onConfirm) => {
  toast(
    ({ closeToast }) => (
      <ToastConfirm message={message} onConfirm={onConfirm} closeToast={closeToast} />
    ),
    { autoClose: false, closeOnClick: false, closeButton: false }
  );
};
// ────────────────────────────────────────────────────────────────────────────

const MyAccount = () => {

  const { customer, isLoggedIn, loading, token, setCustomer, logout } = useAuth();
  const { wishlistItems, removeFromWishlist, addToCart, cartItems, clearCart, onLogout } = useCart();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('dashboard');

  /* Profile */
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm]       = useState({ name: '', phone: '', email: '' });
  const [savingProfile, setSavingProfile]   = useState(false);

  /* States & Districts API */
  const [statesData, setStatesData] = useState([]);

  const [newAddrDistricts,  setNewAddrDistricts]  = useState([]);
  const [editAddrDistricts, setEditAddrDistricts] = useState([]);
  const [shipDistricts,     setShipDistricts]     = useState([]);

  /* Addresses */
  const [addresses, setAddresses]                 = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [editingAddrId, setEditingAddrId]         = useState(null);
  const [addrForm, setAddrForm]                   = useState(emptyAddr);
  const [savingAddr, setSavingAddr]               = useState(false);
  const [showAddNew, setShowAddNew]               = useState(false);
  const [newAddrForm, setNewAddrForm]             = useState(emptyAddr);
  const [addingNew, setAddingNew]                 = useState(false);

  const [editingShipId, setEditingShipId]   = useState(null);
  const [shipForm, setShipForm]             = useState({});
  const [savingShip, setSavingShip]         = useState(false);

  /* Orders */
  const [orders, setOrders]               = useState([]);
  const [recentOrders, setRecentOrders]   = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  /* Settings */
  const [settings, setSettings] = useState({ emailNotif: true, smsNotif: false, promoOffers: true });
  const [savingSettings, setSavingSettings] = useState(false);

  /* ── Password (email-based) — 6-digit numeric ── */
  const [pwEmail,       setPwEmail]       = useState('');
  const [pwOtp,         setPwOtp]         = useState('');
  const [newPw,         setNewPw]         = useState('');
  const [confirmPw,     setConfirmPw]     = useState('');
  const [otpSent,       setOtpSent]       = useState(false);
  const [otpVerified,   setOtpVerified]   = useState(false);
  const [sendingOtp,    setSendingOtp]    = useState(false);
  const [verifyingOtp,  setVerifyingOtp]  = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);

  /* Delete */
  const [deleteConfirm, setDeleteConfirm]     = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, loading, navigate]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json')
      .then(res => res.json())
      .then(data => setStatesData(data.states || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (customer) {
      setProfileForm({ name: customer.name || '', phone: customer.phone || '', email: customer.email || '' });
      setAddresses(customer.addresses || []);
      setPwEmail(customer.email || '');
      fetchShippingAddresses(customer.id);
    }
  }, [customer.id]);

  const fetchShippingAddresses = async (customerId) => {
    try {
      const res = await axios.get(`${API}/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const addrs = res.data?.ShippingAddresses || [];
      setShippingAddresses(addrs);
      setCustomer(prev => {
        const merged = { ...prev, shippingAddresses: addrs };
        localStorage.setItem('customerData', JSON.stringify(merged));
        return merged;
      });
    } catch (err) {
      console.error('Could not fetch shipping addresses:', err);
      setShippingAddresses(customer.shippingAddresses || []);
    }
  };

  useEffect(() => {
    if (activeSection === 'orders' && isLoggedIn) fetchOrders();
  }, [activeSection]);

  useEffect(() => {
    if (isLoggedIn && customer) fetchRecentOrders();
  }, [isLoggedIn, customer]);

  /* ─── API Calls ─── */
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axios.get(`${API}/orders/customer/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/orders/customer/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(data) ? data : data.orders || [];
      setRecentOrders(list.slice(0, 5));
    } catch { /* silent */ }
  };

  /* ─── Wishlist helpers ─── */
  const IMG_BASE = IMG;

  const getWishImg = (item) => {
    if (item.mainImage) return `${IMG_BASE}/${item.mainImage}`;
    if (item.img && item.img.startsWith('http')) return item.img;
    if (item.img) return item.img;
    return '/assets/placeholder.png';
  };

  const getWishStock = (item) => {
    if (item.variants && item.variants.length > 0)
      return item.variants.reduce((s, v) => s + Number(v.quantity || 0), 0);
    return Number(item.totalStock) || 0;
  };

  const getWishDiscount = (item) => {
    const sale = Number(item.salesPrice || item.price);
    const mrp  = Number(item.mrpPrice);
    if (mrp > sale && mrp > 0) return Math.round(((mrp - sale) / mrp) * 100);
    return 0;
  };

  const isItemInCart = (item) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(
      c => String(c.productId || c.id) === String(item.productId || item.id)
    );
  };

  const handleMoveToCart = (item) => {
    const stock = getWishStock(item);
    if (stock === 0) { showOutOfStockToast(); return; }

    const alreadyInCart = isItemInCart(item);
    if (alreadyInCart) {
      navigate('/cart');
      return;
    }

    addToCart(item, 1);
    removeFromWishlist(item.wishlistItemId || item.id, item.id);
    showCartAddedToast(item.name);
  };

  const handleRemoveWishlist = (item) => {
    removeFromWishlist(item.wishlistItemId || item.id, item.id);
    showWishlistRemovedToast(item.name);
  };

  const handleWishProductClick = async (item) => {
    try {
      const res = await axios.get(`${API}/products/${item.id}`);
      navigate(`/shop/${toProductSlug(res.data)}`, { state: { product: res.data } });
    } catch {
      navigate(`/shop/${toProductSlug(item)}`, { state: { product: item } });
    }
  };

  /* ─── Profile ─── */
  const handleSaveProfile = async () => {
    // FIX 1: only require name — phone can be optional or already filled
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    // FIX 2: validate phone only if provided
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone.trim())) {
      toast.error('Phone number must be exactly 10 digits'); return;
    }
    setSavingProfile(true);
    try {
      await axios.put(
        `${API}/customers/update/${customer.id}`,
        { name: profileForm.name.trim(), phone: profileForm.phone.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // FIX 3: update localStorage so changes persist after page refresh
      setCustomer(prev => {
        const merged = { ...prev, name: profileForm.name.trim(), phone: profileForm.phone.trim() };
        localStorage.setItem('customerData', JSON.stringify(merged));
        return merged;
      });
      toast.success('Profile updated successfully!');
      setEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ─── Address ─── */
  const handleEditAddr = (addr) => {
    setEditingAddrId(addr.id);
    setAddrForm({
      houseNo: addr.houseNo || '', street: addr.street || '',
      city: addr.city || '', state: addr.state || '',
      pincode: addr.pincode || '', district: addr.district || '', country: addr.country || 'India',
    });
    const sel = statesData.find(s => s.state === addr.state);
    setEditAddrDistricts(sel ? sel.districts : []);
  };

  const handleSaveAddr = async (addrId) => {
    const { houseNo, street, city, state, pincode } = addrForm;
    if (!houseNo || !street || !city || !state || !pincode) { toast.error('Please fill all address fields'); return; }
    setSavingAddr(true);
    try {
      await axios.put(
        `${API}/customers/address/update/${addrId}`,
        addrForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(prev => prev.map(a => a.id === addrId ? { ...a, ...addrForm } : a));
      setCustomer(prev => ({
        ...prev,
        addresses: prev.addresses.map(a => a.id === addrId ? { ...a, ...addrForm } : a),
      }));
      toast.success('Address updated!');
      setEditingAddrId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Address update failed');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleAddNewAddress = async () => {
    const { houseNo, street, city, state, pincode } = newAddrForm;
    if (!houseNo || !street || !city || !state || !pincode) { toast.error('Please fill all address fields'); return; }
    setAddingNew(true);
    try {
      const { data } = await axios.post(
        `${API}/customers/add-shipping`,
        {
          customerId:  customer.id,
          name:        customer.name,
          phone:       customer.phone,
          addressLine: `${newAddrForm.houseNo}, ${newAddrForm.street}`,
          city:        newAddrForm.city,
          state:       newAddrForm.state,
          pincode:     newAddrForm.pincode,
          district:    newAddrForm.district || '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newAddr = data.address || { id: Date.now(), ...newAddrForm };

      const updatedShipping = [...shippingAddresses, newAddr];
      setShippingAddresses(updatedShipping);

      setCustomer(prev => {
        const merged = { ...prev, shippingAddresses: updatedShipping };
        localStorage.setItem('customerData', JSON.stringify(merged));
        return merged;
      });

      toast.success('Address added!');
      setShowAddNew(false);
      setNewAddrForm(emptyAddr);
      setNewAddrDistricts([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setAddingNew(false);
    }
  };

  const handleDeleteAddr = (addrId) => {
    confirmToast('Delete this address?', async () => {
      try {
        await axios.delete(`${API}/customers/shipping/${addrId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(prev => prev.filter(a => a.id !== addrId));
        setCustomer(prev => ({ ...prev, addresses: prev.addresses.filter(a => a.id !== addrId) }));
        toast.success('Address removed');
      } catch {
        toast.error('Could not delete address');
      }
    });
  };

  /* ─── Shipping Address Edit / Delete ─── */
  const handleEditShip = (addr) => {
    setEditingShipId(addr.id);
    setShipForm({
      name:        addr.name        || '',
      phone:       addr.phone       || '',
      addressLine: addr.addressLine || '',
      city:        addr.city        || '',
      state:       addr.state       || '',
      pincode:     addr.pincode     || '',
      district:    addr.district    || '',
    });
    const sel = statesData.find(s => s.state === addr.state);
    setShipDistricts(sel ? sel.districts : []);
  };

  const handleSaveShip = async (addrId) => {
    const { name, phone, addressLine, city, state, pincode } = shipForm;
    if (!name || !phone || !addressLine || !city || !state || !pincode) {
      toast.error('Please fill all required fields'); return;
    }
    if (!/^\d{6}$/.test(pincode)) { toast.error('Pincode must be 6 digits'); return; }
    setSavingShip(true);
    try {
      await axios.put(
        `${API}/customers/shipping/update/${addrId}`,
        { ...shipForm, country: 'India' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = { ...shippingAddresses.find(a => a.id === addrId), ...shipForm };
      const newList = shippingAddresses.map(a => a.id === addrId ? updated : a);
      setShippingAddresses(newList);
      setCustomer(prev => {
        const merged = { ...prev, shippingAddresses: newList };
        localStorage.setItem('customerData', JSON.stringify(merged));
        return merged;
      });
      toast.success('Shipping address updated! ');
      setEditingShipId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingShip(false);
    }
  };

  const handleDeleteShip = (addrId) => {
    confirmToast('Delete this shipping address?', async () => {
      try {
        await axios.delete(`${API}/customers/shipping/${addrId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newList = shippingAddresses.filter(a => a.id !== addrId);
        setShippingAddresses(newList);
        setCustomer(prev => {
          const merged = { ...prev, shippingAddresses: newList };
          localStorage.setItem('customerData', JSON.stringify(merged));
          return merged;
        });
        toast.success('Shipping address removed');
      } catch {
        toast.error('Could not delete shipping address');
      }
    });
  };

  /* ─── Settings ─── */
  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      await axios.put(`${API}/customers/settings/${customer.id}`, settings, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }

  /* ─── Password — 6-digit numeric OTP flow (matches backend & ForgotPassword) ─── */
  const handleSendOtp = async () => {
    if (!pwEmail) { toast.error('Email is required'); return; }
    setSendingOtp(true);
    try {
      await axios.post(`${API}/customers/forgot-password`, { email: pwEmail });
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pwOtp) { toast.error('Enter the OTP'); return; }
    setVerifyingOtp(true);
    try {
      await axios.post(`${API}/customers/verify-otp`, { email: pwEmail, otp: pwOtp });
      setOtpVerified(true);
      toast.success('OTP verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ✅ FIXED: matches backend /^\d{6}$/ validation — exactly 6 digits
  const handleResetPassword = async () => {
    if (!newPw || !confirmPw) { toast.error('Please fill all fields'); return; }
    if (!/^\d{6}$/.test(newPw)) { toast.error('Password must be exactly 6 numbers!'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match!'); return; }
    setSavingPw(true);
    try {
      await axios.post(`${API}/customers/reset-password`, {
        email: pwEmail, otp: pwOtp, newPassword: newPw,
      });
      toast.success('Password updated successfully!');
      setOtpSent(false);
      setOtpVerified(false);
      setPwOtp('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setSavingPw(false);
    }
  };

  /* ─── Delete Account ─── */
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeletingAccount(true);
    try {
      await axios.delete(`${API}/customers/delete/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Account deleted successfully!');

      if (typeof onLogout === 'function') onLogout();
      logout();
      navigate('/');

    } catch (err) {
      console.error('Delete account error:', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  /* ─── Logout ─── */
  const handleLogout = () => {
    if (typeof onLogout === 'function') onLogout();
    logout();
    navigate('/login');
  };

  const orderStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'delivered';
    if (s === 'shipped' || s === 'out for delivery') return 'shipped';
    if (s === 'cancelled') return 'cancelled';
    return 'pending';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: 18, color: '#d1a309' }}>
        Loading...
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="ma-page">

      {/* ══ BANNER ══ */}
      <div className="ma-banner">
        <div className="ma-banner-wave" />
        <div className="ma-banner-inner">
          <div className="ma-avatar-big">{customer.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="ma-logo-label">ARS Fashion World</div>
            <h1 className="ma-banner-title">My Account</h1>
            <p className="ma-banner-sub">Manage your profile &amp; preferences</p>
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="ma-body">

        {/* ── SIDEBAR ── */}
        <aside className="ma-sidebar">
          <div className="ma-sidebar-header">Account Menu</div>
          {SECTIONS.map((s) => (
            <React.Fragment key={s.id}>
              {s.id === 'delete' && <div className="ma-nav-divider" />}
              <div
                className={`ma-nav-item${activeSection === s.id ? ' active' : ''}${s.danger ? ' danger' : ''}`}
                onClick={() => {
                  if (s.id === 'logout') { handleLogout(); return; }
                  setActiveSection(s.id);
                }}
              >
                <s.Icon className="ma-nav-icon" />
                {s.label}
              </div>
            </React.Fragment>
          ))}
        </aside>

        {/* ── CONTENT ── */}
        <main className="ma-content">

          {/* ════ DASHBOARD ════ */}
          {activeSection === 'dashboard' && (
            <>
              <div className="ma-welcome-card">
                <div>
                  <div className="ma-welcome-greeting">Welcome back,</div>
                  <div className="ma-welcome-name">{customer.name}!</div>
                  <div className="ma-welcome-date">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="ma-welcome-emoji">👋</div>
              </div>

              <div className="ma-stats">
                <div className="ma-stat" onClick={() => setActiveSection('orders')} style={{ cursor: 'pointer' }}>
                  <MdShoppingBag className="ma-stat-icon" />
                  <div className="ma-stat-val">{recentOrders.length || orders.length || 0}</div>
                  <div className="ma-stat-lbl">Total Orders</div>
                </div>
                <div className="ma-stat" onClick={() => setActiveSection('delivery')} style={{ cursor: 'pointer' }}>
                  <MdLocationOn className="ma-stat-icon" />
                  <div className="ma-stat-val">{shippingAddresses.length}</div>
                  <div className="ma-stat-lbl">Saved Addresses</div>
                </div>
                <div className="ma-stat" onClick={() => setActiveSection('wishlist')} style={{ cursor: 'pointer' }}>
                  <MdFavorite className="ma-stat-icon" />
                  <div className="ma-stat-val">{wishlistItems.length}</div>
                  <div className="ma-stat-lbl">Wishlist</div>
                </div>
                <div className="ma-stat">
                  <MdShoppingCart className="ma-stat-icon" />
                  <div className="ma-stat-val">{cartItems ? cartItems.length : 0}</div>
                  <div className="ma-stat-lbl">Cart Items</div>
                </div>
              </div>

              <div className="ma-card">
                <div className="ma-card-hdr">
                  <span className="ma-card-ttl">Recent Orders</span>
                  <button className="ma-btn-gold" onClick={() => setActiveSection('orders')}>View All</button>
                </div>
                <div className="ma-card-body" style={{ padding: '0 28px' }}>
                  {recentOrders.length === 0 ? (
                    <div className="ma-empty" style={{ padding: '32px 0' }}>
                      <MdShoppingBag className="ma-empty-icon" />
                      No orders yet
                    </div>
                  ) : (
                    recentOrders.map((order, idx) => (
                      <div className="ma-order" key={order.id || idx}>
                        <div>
                          <div className="ma-order-id">#{order.id || order.orderId}</div>
                          <div className="ma-order-meta">
                            {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {order.totalAmount && ` · ₹${Number(order.totalAmount).toLocaleString('en-IN')}`}
                          </div>
                        </div>
                        <span className={`ma-badge ${orderStatusClass(order.status || order.orderStatus)}`}>
                          {order.status || order.orderStatus || 'Pending'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* ════ MY PROFILE ════ */}
          {activeSection === 'profile' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">My Profile</span>
                {!editingProfile && (
                  <button className="ma-btn-gold" onClick={() => setEditingProfile(true)}>
                    <MdEdit style={{ marginRight: 4, verticalAlign: 'middle' }} />Edit
                  </button>
                )}
              </div>
              <div className="ma-card-body">
                {editingProfile ? (
                  <div className="ma-form">
                    <div className="ma-2col">
                      <div className="ma-field">
                        <label>Full Name</label>
                        <input type="text" value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Your name" />
                      </div>
                      <div className="ma-field">
                        <label>Phone</label>
                        <input type="text" value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="Phone number" />
                      </div>
                    </div>
                    <div className="ma-field">
                      <label>Email</label>
                      <input type="email" value={profileForm.email} disabled className="ma-input-disabled" />
                      <span className="ma-field-note">Email cannot be changed</span>
                    </div>
                    <div className="ma-form-actions">
                      <button className="ma-btn-save" onClick={handleSaveProfile} disabled={savingProfile}>
                        <MdSave style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        {savingProfile ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button className="ma-btn-cancel" onClick={() => setEditingProfile(false)}>
                        <MdClose style={{ marginRight: 4, verticalAlign: 'middle' }} />Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ma-ig">
                    {[
                      { lbl: 'Full Name',    val: customer.name,  Icon: MdPerson },
                      { lbl: 'Phone',        val: customer.phone || '—', Icon: MdPhone },
                      { lbl: 'Email',        val: customer.email, Icon: MdEmail },
                      { lbl: 'Member Since', val: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', Icon: MdCalendarToday },
                    ].map(item => (
                      <div className="ma-ig-item" key={item.lbl}>
                        <div className="ma-ig-lbl"><item.Icon style={{ marginRight: 5, verticalAlign: 'middle' }} />{item.lbl}</div>
                        <div className="ma-ig-val">{item.val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ MY ORDERS ════ */}
          {activeSection === 'orders' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">My Orders</span>
              </div>
              <div className="ma-card-body" style={{ padding: '0 28px' }}>
                {loadingOrders ? (
                  <div className="ma-empty"><MdShoppingBag className="ma-empty-icon spin" />Loading orders…</div>
                ) : orders.length === 0 ? (
                  <div className="ma-empty">
                    <MdShoppingBag className="ma-empty-icon" />
                    No orders yet
                  </div>
                ) : (
                  orders.map((order, idx) => (
                    <div className="ma-order" key={order.id || idx}>
                      <div>
                        <div className="ma-order-id">#{order.id || order.orderId}</div>
                        <div className="ma-order-meta">
                          {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {order.totalAmount && ` · ₹${Number(order.totalAmount).toLocaleString('en-IN')}`}
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="ma-order-items">
                            {order.items.map((item, i) => (
                              <span key={i} className="ma-order-item-tag">
                                {item.productName} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`ma-badge ${orderStatusClass(order.status || order.orderStatus)}`}>
                        {order.status || order.orderStatus || 'Pending'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ════ MY WISHLIST ════ */}
          {activeSection === 'wishlist' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">My Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="ma-wish-count-badge">{wishlistItems.length} Items</span>
                )}
              </div>
              <div className="ma-card-body">
                {wishlistItems.length === 0 ? (
                  <div className="ma-empty">
                    <MdFavorite className="ma-empty-icon" />
                    Your wishlist is empty
                    <button className="ma-btn-gold" style={{ marginTop: 12 }} onClick={() => navigate('/shop')}>
                      Explore Shop
                    </button>
                  </div>
                ) : (
                  <div className="ma-wishlist-grid">
                    {wishlistItems.map(item => {
                      const stock     = getWishStock(item);
                      const inStock   = stock > 0;
                      const discount  = getWishDiscount(item);
                      const salePrice = Number(item.salesPrice || item.price || 0);
                      const mrpPrice  = Number(item.mrpPrice || 0);
                      const category  = item.category?.name || item.category || '';
                      const isInCart  = isItemInCart(item);

                      return (
                        <div key={item.wishlistItemId || item.id} className="ma-wish-card">
                          <div className="ma-wish-img-wrap" onClick={() => handleWishProductClick(item)}>
                            <img
                              src={getWishImg(item)}
                              alt={item.name}
                              className="ma-wish-img"
                              onError={e => { e.target.src = '/assets/placeholder.png'; }}
                            />
                            <span className={`ma-wish-stock-badge ${inStock ? 'in' : 'out'}`}>
                              {inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <div className="ma-wish-view-overlay">
                              <MdVisibility style={{ marginRight: 6 }} />View Details
                            </div>
                          </div>
                          <button
                            className="ma-wish-remove"
                            onClick={() => handleRemoveWishlist(item)}
                            title="Remove from wishlist"
                          >
                            <MdClose />
                          </button>
                          <div className="ma-wish-info">
                            <div className="ma-wish-name" onClick={() => handleWishProductClick(item)}>
                              {item.name}
                            </div>
                            {category && <div className="ma-wish-cat">{category}</div>}
                            <div className="ma-wish-price-row">
                              <span className="ma-wish-price-sale">₹{salePrice.toLocaleString('en-IN')}</span>
                              {mrpPrice > salePrice && (
                                <span className="ma-wish-price-mrp">₹{mrpPrice.toLocaleString('en-IN')}</span>
                              )}
                              {discount > 0 && (
                                <span className="ma-wish-discount-pill">{discount}% OFF</span>
                              )}
                            </div>
                            {isInCart ? (
                              <button
                                className="ma-wish-cart-btn go-to-cart"
                                onClick={() => navigate('/cart')}
                              >
                                <MdShoppingCart style={{ marginRight: 6 }} />
                                Go to Cart
                              </button>
                            ) : (
                              <button
                                className={`ma-wish-cart-btn${!inStock ? ' oos' : ''}`}
                                onClick={() => handleMoveToCart(item)}
                                disabled={!inStock}
                              >
                                <MdShoppingCart style={{ marginRight: 6 }} />
                                {inStock ? 'Move to Cart' : 'Out of Stock'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ DELIVERY ADDRESS ════ */}
          {activeSection === 'delivery' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">Delivery Address</span>
                <button className="ma-btn-gold" onClick={() => setShowAddNew(!showAddNew)}>
                  {showAddNew ? <><MdClose style={{ verticalAlign: 'middle', marginRight: 4 }} />Cancel</> : <><MdAdd style={{ verticalAlign: 'middle', marginRight: 4 }} />Add New</>}
                </button>
              </div>
              <div className="ma-card-body">
                {showAddNew && (
                  <div className="ma-addr-new-form">
                    <p className="ma-addr-form-title">New Address</p>
                    <div className="ma-2col">
                      <div className="ma-field">
                        <label>House No / Flat</label>
                        <input type="text" placeholder="House No / Flat / Building *"
                          value={newAddrForm.houseNo}
                          onChange={e => setNewAddrForm({ ...newAddrForm, houseNo: e.target.value })} />
                      </div>
                      <div className="ma-field">
                        <label>Street / Area</label>
                        <input type="text" placeholder="Street / Area / Landmark *"
                          value={newAddrForm.street}
                          onChange={e => setNewAddrForm({ ...newAddrForm, street: e.target.value })} />
                      </div>
                    </div>
                    <div className="ma-2col">
                      <div className="ma-field">
                        <label>City</label>
                        <input type="text" placeholder="City *"
                          value={newAddrForm.city}
                          onChange={e => setNewAddrForm({ ...newAddrForm, city: e.target.value })} />
                      </div>
                      <div className="ma-field">
                        <label>PIN Code</label>
                        <input type="text" placeholder="PIN Code *"
                          value={newAddrForm.pincode}
                          onChange={e => setNewAddrForm({ ...newAddrForm, pincode: e.target.value })} />
                      </div>
                    </div>
                    <div className="ma-field">
                      <label>State</label>
                      <select value={newAddrForm.state}
                        onChange={e => {
                          const sel = statesData.find(s => s.state === e.target.value);
                          setNewAddrDistricts(sel ? sel.districts : []);
                          setNewAddrForm({ ...newAddrForm, state: e.target.value, district: '' });
                        }}>
                        <option value="">Select State *</option>
                        {statesData.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                      </select>
                    </div>
                    {newAddrDistricts.length > 0 && (
                      <div className="ma-field">
                        <label>District</label>
                        <select value={newAddrForm.district || ''}
                          onChange={e => setNewAddrForm({ ...newAddrForm, district: e.target.value })}>
                          <option value="">Select District</option>
                          {newAddrDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="ma-form-actions">
                      <button className="ma-btn-save" onClick={handleAddNewAddress} disabled={addingNew}>
                        {addingNew ? 'Adding…' : 'Add Address'}
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 && shippingAddresses.length === 0 && !showAddNew ? (
                  <div className="ma-empty">
                    <MdLocationOn className="ma-empty-icon" />
                    No addresses saved yet
                    <button className="ma-btn-gold" style={{ marginTop: 12 }} onClick={() => setShowAddNew(true)}>
                      <MdAdd style={{ verticalAlign: 'middle', marginRight: 4 }} />Add Your First Address
                    </button>
                  </div>
                ) : (
                  <>
                    {addresses.map((addr, idx) => (
                      <div className="ma-addr-card" key={addr.id || idx}>
                        {editingAddrId === addr.id ? (
                          <div>
                            <p className="ma-addr-form-title">Edit Address</p>
                            <div className="ma-2col">
                              <div className="ma-field">
                                <label>House No / Flat</label>
                                <input type="text" value={addrForm.houseNo}
                                  onChange={e => setAddrForm({ ...addrForm, houseNo: e.target.value })} />
                              </div>
                              <div className="ma-field">
                                <label>Street / Area</label>
                                <input type="text" value={addrForm.street}
                                  onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} />
                              </div>
                            </div>
                            <div className="ma-2col">
                              <div className="ma-field">
                                <label>City</label>
                                <input type="text" value={addrForm.city}
                                  onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} />
                              </div>
                              <div className="ma-field">
                                <label>PIN Code</label>
                                <input type="text" value={addrForm.pincode}
                                  onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })} />
                              </div>
                            </div>
                            <div className="ma-field">
                              <label>State</label>
                              <select value={addrForm.state}
                                onChange={e => {
                                  const sel = statesData.find(s => s.state === e.target.value);
                                  setEditAddrDistricts(sel ? sel.districts : []);
                                  setAddrForm({ ...addrForm, state: e.target.value, district: '' });
                                }}>
                                <option value="">Select State *</option>
                                {statesData.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                              </select>
                            </div>
                            {editAddrDistricts.length > 0 && (
                              <div className="ma-field">
                                <label>District</label>
                                <select value={addrForm.district || ''}
                                  onChange={e => setAddrForm({ ...addrForm, district: e.target.value })}>
                                  <option value="">Select District</option>
                                  {editAddrDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>
                            )}
                            <div className="ma-form-actions">
                              <button className="ma-btn-save" onClick={() => handleSaveAddr(addr.id)} disabled={savingAddr}>
                                {savingAddr ? 'Saving…' : 'Save Address'}
                              </button>
                              <button className="ma-btn-cancel" onClick={() => setEditingAddrId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="ma-addr-badge">{idx === 0 ? 'Primary' : `Address ${idx + 1}`}</div>
                            <p className="ma-addr-text">
                              {addr.houseNo && `${addr.houseNo}, `}{addr.street && `${addr.street},`}<br />
                              {addr.city}, {addr.state} — {addr.pincode}<br />
                              {addr.country}
                            </p>
                            <div className="ma-addr-actions">
                              <button className="ma-btn-sm ma-btn-edit" onClick={() => handleEditAddr(addr)}>
                                <MdEdit style={{ verticalAlign: 'middle', marginRight: 4 }} />Edit
                              </button>
                              <button className="ma-btn-sm ma-btn-del" onClick={() => handleDeleteAddr(addr.id)}>
                                <MdDeleteForever style={{ verticalAlign: 'middle', marginRight: 4 }} />Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {shippingAddresses.length > 0 && (
                      <>
                        <div className="ma-addr-section-label">Saved Delivery Addresses</div>
                        {shippingAddresses.map((addr, idx) => (
                          <div className="ma-addr-card ma-addr-card--shipping" key={`ship-${addr.id}`}>
                            {editingShipId === addr.id ? (
                              <div>
                                <p className="ma-addr-form-title">Edit Delivery Address #{idx + 1}</p>
                                <div className="ma-2col">
                                  <div className="ma-field">
                                    <label>Full Name *</label>
                                    <input type="text" value={shipForm.name}
                                      onChange={e => setShipForm({ ...shipForm, name: e.target.value })}
                                      placeholder="Full name" />
                                  </div>
                                  <div className="ma-field">
                                    <label>Phone *</label>
                                    <input type="text" value={shipForm.phone} maxLength={10}
                                      onChange={e => setShipForm({ ...shipForm, phone: e.target.value })}
                                      placeholder="10-digit phone" />
                                  </div>
                                </div>
                                <div className="ma-field">
                                  <label>Address Line *</label>
                                  <input type="text" value={shipForm.addressLine}
                                    onChange={e => setShipForm({ ...shipForm, addressLine: e.target.value })}
                                    placeholder="House no, Street, Area, Landmark" />
                                </div>
                                <div className="ma-2col">
                                  <div className="ma-field">
                                    <label>City *</label>
                                    <input type="text" value={shipForm.city}
                                      onChange={e => setShipForm({ ...shipForm, city: e.target.value })}
                                      placeholder="City" />
                                  </div>
                                  <div className="ma-field">
                                    <label>PIN Code *</label>
                                    <input type="text" value={shipForm.pincode} maxLength={6}
                                      onChange={e => setShipForm({ ...shipForm, pincode: e.target.value })}
                                      placeholder="6-digit pincode" />
                                  </div>
                                </div>
                                <div className="ma-field">
                                  <label>State *</label>
                                  <select value={shipForm.state}
                                    onChange={e => {
                                      const sel = statesData.find(s => s.state === e.target.value);
                                      setShipDistricts(sel ? sel.districts : []);
                                      setShipForm({ ...shipForm, state: e.target.value, district: '' });
                                    }}>
                                    <option value="">Select State *</option>
                                    {statesData.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                                  </select>
                                </div>
                                {shipDistricts.length > 0 && (
                                  <div className="ma-field">
                                    <label>District</label>
                                    <select value={shipForm.district || ''}
                                      onChange={e => setShipForm({ ...shipForm, district: e.target.value })}>
                                      <option value="">Select District</option>
                                      {shipDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                  </div>
                                )}
                                <div className="ma-form-actions">
                                  <button className="ma-btn-save" onClick={() => handleSaveShip(addr.id)} disabled={savingShip}>
                                    {savingShip ? 'Saving…' : 'Save Address'}
                                  </button>
                                  <button className="ma-btn-cancel" onClick={() => setEditingShipId(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="ma-addr-badge ma-addr-badge--ship">Delivery Address #{idx + 1}</div>
                                <p className="ma-addr-text">
                                  {addr.name && <><strong>{addr.name}</strong><br /></>}
                                  {addr.phone && <>{addr.phone}<br /></>}
                                  {addr.addressLine},<br />
                                  {addr.district && <>{addr.district}, </>}
                                  {addr.city}, {addr.state} — {addr.pincode}
                                </p>
                                <div className="ma-addr-actions">
                                  <button className="ma-btn-sm ma-btn-edit" onClick={() => handleEditShip(addr)}>
                                    <MdEdit style={{ verticalAlign: 'middle', marginRight: 4 }} />Edit
                                  </button>
                                  <button className="ma-btn-sm ma-btn-del" onClick={() => handleDeleteShip(addr.id)}>
                                    <MdDeleteForever style={{ verticalAlign: 'middle', marginRight: 4 }} />Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ════ ACCOUNT SETTINGS ════ */}
          {activeSection === 'settings' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">Account Settings</span>
              </div>
              <div className="ma-card-body">
                <div className="ma-settings-intro">
                  <div className="ma-settings-user-info">
                    <div className="ma-settings-avatar">{customer.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="ma-settings-name">{customer.name}</div>
                      <div className="ma-settings-email">{customer.email}</div>
                    </div>
                  </div>
                </div>
                <div className="ma-settings-links">
                  <div className="ma-settings-link-title">Account Actions</div>
                  <div className="ma-settings-link-row" onClick={() => setActiveSection('password')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <MdLock style={{ fontSize: 20, color: '#d1a309' }} />
                      <div>
                        <div className="ma-setting-label">Reset Password</div>
                        <div className="ma-setting-desc">Change your account password via email OTP</div>
                      </div>
                    </div>
                    <MdChevronRight style={{ fontSize: 22, color: '#bbb' }} />
                  </div>
                  <div className="ma-settings-link-row danger" onClick={() => setActiveSection('delete')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <MdDeleteForever style={{ fontSize: 20, color: '#e53935' }} />
                      <div>
                        <div className="ma-setting-label" style={{ color: '#e53935' }}>Delete Account</div>
                        <div className="ma-setting-desc">Permanently remove your account and data</div>
                      </div>
                    </div>
                    <MdChevronRight style={{ fontSize: 22, color: '#e53935' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ RESET PASSWORD ════ */}
          {activeSection === 'password' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">Reset Password</span>
              </div>
              <div className="ma-card-body">
                <div className="ma-form">

                  {/* ── Step 1: Send OTP ── */}
                  <div className="ma-otp-step">
                    <div className="ma-otp-step-label">
                      <span className={`ma-otp-badge ${otpSent ? 'done' : 'active'}`}>1</span>
                      Verify Your Email
                    </div>
                    <div className="ma-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={pwEmail}
                        onChange={e => setPwEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={otpSent}
                        className={otpSent ? 'ma-input-disabled' : ''}
                      />
                    </div>
                    {!otpSent && (
                      <div className="ma-form-actions">
                        <button className="ma-btn-save" onClick={handleSendOtp} disabled={sendingOtp}>
                          <MdEmail style={{ marginRight: 6, verticalAlign: 'middle' }} />
                          {sendingOtp ? 'Sending…' : 'Send OTP to Email'}
                        </button>
                      </div>
                    )}
                    {otpSent && !otpVerified && (
                      <div className="ma-otp-resend">
                        OTP sent!{' '}
                        <span
                          className="ma-otp-resend-link"
                          onClick={() => { setOtpSent(false); setPwOtp(''); }}
                        >
                          Resend
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Step 2: Verify OTP ── */}
                  {otpSent && !otpVerified && (
                    <div className="ma-otp-step">
                      <div className="ma-otp-step-label">
                        <span className="ma-otp-badge active">2</span>
                        Enter OTP
                      </div>
                      <div className="ma-field">
                        <label>OTP (sent to your email)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pwOtp}
                          onChange={e => setPwOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                      </div>
                      <div className="ma-form-actions">
                        <button className="ma-btn-save" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                          {verifyingOtp ? 'Verifying…' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Set New Password — 6-digit numeric ── */}
                  {otpVerified && (
                    <div className="ma-otp-step">
                      <div className="ma-otp-step-label">
                        <span className="ma-otp-badge active">3</span>
                        Set New Password
                      </div>
                      <div className="ma-2col">
                        <div className="ma-field">
                          <label>New Password</label>
                          {/* ✅ digits only, max 6, matches backend /^\d{6}$/ */}
                          <input
                            type="password"
                            placeholder="New Password (exactly 6 numbers) *"
                            value={newPw}
                            maxLength={6}
                            inputMode="numeric"
                            onChange={e => setNewPw(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          />
                          {newPw.length > 0 && (
                            <div style={{
                              fontSize: 12,
                              color: /^\d{6}$/.test(newPw) ? '#2e7d32' : '#e53935',
                              marginTop: 4,
                            }}>
                              {/^\d{6}$/.test(newPw) ? '✓ Valid 6-digit password' : 'Must be exactly 6 digits'}
                            </div>
                          )}
                        </div>
                        <div className="ma-field">
                          <label>Confirm Password</label>
                          {/* ✅ digits only, max 6 */}
                          <input
                            type="password"
                            placeholder="Confirm New Password *"
                            value={confirmPw}
                            maxLength={6}
                            inputMode="numeric"
                            onChange={e => setConfirmPw(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          />
                          {confirmPw.length > 0 && newPw !== confirmPw && (
                            <div style={{ fontSize: 12, color: '#e53935', marginTop: 4 }}>
                              ✗ Passwords do not match
                            </div>
                          )}
                          {confirmPw.length > 0 && confirmPw.length === 6 && newPw === confirmPw && (
                            <div style={{ fontSize: 12, color: '#2e7d32', marginTop: 4 }}>
                              ✓ Passwords match
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="ma-field-note" style={{ marginBottom: 16 }}>
                        Password must be exactly 6 numbers (digits only).
                      </p>
                      <div className="ma-form-actions">
                        <button
                          className="ma-btn-save"
                          onClick={handleResetPassword}
                          disabled={savingPw || !/^\d{6}$/.test(newPw) || newPw !== confirmPw}
                        >
                          <MdLock style={{ marginRight: 6, verticalAlign: 'middle' }} />
                          {savingPw ? 'Updating…' : 'Update Password'}
                        </button>
                        <button
                          className="ma-btn-cancel"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpVerified(false);
                            setPwOtp('');
                            setNewPw('');
                            setConfirmPw('');
                          }}
                        >
                          <MdClose style={{ marginRight: 4, verticalAlign: 'middle' }} />Clear
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ════ DELETE ACCOUNT ════ */}
          {activeSection === 'delete' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">Delete Account</span>
              </div>
              <div className="ma-card-body">
                <div className="ma-danger-alert">
                  <div className="ma-danger-alert-title">
                    <MdWarning style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Warning: This action is irreversible
                  </div>
                  <div className="ma-danger-alert-desc">
                    Deleting your account will permanently remove all your data, order history,
                    saved addresses, and preferences. You will not be able to recover this information.
                  </div>
                </div>
                <div className="ma-field" style={{ marginTop: 20 }}>
                  <label>Type <strong>DELETE</strong> to confirm</label>
                  <input
                    type="text"
                    placeholder="Type DELETE here"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    style={{ borderColor: deleteConfirm && deleteConfirm !== 'DELETE' ? '#e53935' : '' }}
                  />
                </div>
                <div className="ma-form-actions">
                  <button
                    className="ma-btn-danger-full"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || deleteConfirm !== 'DELETE'}
                  >
                    <MdDeleteForever style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    {deletingAccount ? 'Deleting…' : 'Delete My Account'}
                  </button>
                  <button className="ma-btn-cancel" onClick={() => { setDeleteConfirm(''); setActiveSection('dashboard'); }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ LOGOUT ════ */}
          {activeSection === 'logout' && (
            <div className="ma-card">
              <div className="ma-card-hdr">
                <span className="ma-card-ttl">Logout</span>
              </div>
              <div className="ma-card-body">
                <div className="ma-logout-center">
                  <MdLogout className="ma-logout-icon" />
                  <div className="ma-logout-title">Are you sure you want to logout?</div>
                  <div className="ma-logout-desc">You will need to sign in again to access your account.</div>
                  <div className="ma-form-actions" style={{ justifyContent: 'center' }}>
                    <button className="ma-btn-danger-full" onClick={handleLogout}>
                      <MdLogout style={{ marginRight: 6, verticalAlign: 'middle' }} />Yes, Logout
                    </button>
                    <button className="ma-btn-cancel" onClick={() => setActiveSection('dashboard')}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MyAccount;