import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Checkout.css';

import { API, IMG as IMG_BASE } from '../../config';

const getImg = (item) => {
  if (item.mainImage) return `${IMG_BASE}/${item.mainImage}`;
  if (item.img && item.img.startsWith('http')) return item.img;
  if (item.img) return item.img;
  return '/assets/placeholder.png';
};

/* ─────────────────────────────────────────────
   Order Confirm Modal
───────────────────────────────────────────── */
const OrderConfirmModal = ({ isOpen, onClose, onConfirm, shippingAddr, finalAmount, cartItems, placing, shippingCharge }) => {
  if (!isOpen) return null;
  return (
    <div className="ocm-overlay" onClick={onClose}>
      <div className="ocm-modal" onClick={e => e.stopPropagation()}>
        <div className="ocm-header">
          <div className="ocm-icon">📦</div>
          <h2 className="ocm-title">Review Your Order</h2>
          <p className="ocm-subtitle">Confirm address & items before payment</p>
        </div>

        <div className="ocm-section">
          <p className="ocm-section-label">🏠 Delivering To</p>
          <div className="ocm-addr-card">
            <strong>{shippingAddr.name}</strong>
            <span>{shippingAddr.phone}</span>
            <span>
              {shippingAddr.addressLine}, {shippingAddr.city}
              {shippingAddr.district ? `, ${shippingAddr.district}` : ''}, {shippingAddr.state} — {shippingAddr.pincode}
            </span>
          </div>
        </div>

        <div className="ocm-section">
          <p className="ocm-section-label">🛍️ {cartItems.length} Item{cartItems.length > 1 ? 's' : ''}</p>
          <div className="ocm-items-list">
            {cartItems.map(item => (
              <div className="ocm-item-row" key={item.cartItemId || item.id}>
                <img
                  src={getImg(item)} alt={item.name}
                  className="ocm-item-img"
                  onError={e => { e.target.src = '/assets/placeholder.png'; }}
                />
                <span className="ocm-item-name">{item.name}</span>
                <span className="ocm-item-qty">×{item.quantity}</span>
                <span className="ocm-item-price">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Shipping charge line in modal ── */}
        {shippingCharge > 0 && (
          <div className="ocm-shipping-row">
            <span>🚚 Shipping ({shippingAddr.state})</span>
            <span>₹{shippingCharge.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="ocm-total-row">
          <span>Total Payable</span>
          <span className="ocm-total-amount">₹{finalAmount.toLocaleString('en-IN')}</span>
        </div>

        <div className="ocm-actions">
          <button className="ocm-btn-secondary" onClick={onClose} disabled={placing}>
            ← Continue Shopping
          </button>
          <button className="ocm-btn-primary" onClick={onConfirm} disabled={placing}>
            {placing ? 'Opening Payment…' : '💳 Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Checkout Component
───────────────────────────────────────────── */
const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { customer, isLoggedIn, token }      = useAuth();
  const navigate = useNavigate();

  const [statesData,     setStatesData]     = useState([]);
  const [districts,      setDistricts]      = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  const [couponCode,        setCouponCode]        = useState('');
  const [discount,          setDiscount]          = useState(0);
  const [appliedCouponId,   setAppliedCouponId]   = useState(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [isValidating,      setIsValidating]      = useState(false);
  const [availableCoupons,  setAvailableCoupons]  = useState([]);

  // ── NEW: Shipping charge state ──────────────────────────
  const [shippingCharge,     setShippingCharge]     = useState(0);
  const [shippingLoading,    setShippingLoading]    = useState(false);
  // ────────────────────────────────────────────────────────

  const [shippingAddr, setShippingAddr] = useState({
    name: '', phone: '', addressLine: '',
    city: '', state: '', pincode: '', district: '',
  });

  const [placing,          setPlacing]          = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ── Final amount includes shipping charge ───────────────
  const finalAmount = totalPrice - discount + shippingCharge;
  // ────────────────────────────────────────────────────────

  // Fetch Indian states
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json')
      .then(res => res.json())
      .then(data => setStatesData(data.states || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout', message: 'Please login to checkout' } });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (customer) {
      setShippingAddr(prev => ({
        ...prev,
        name:  prev.name  || customer.name  || '',
        phone: prev.phone || customer.phone || '',
      }));
      fetchSavedAddresses(customer.id);
    }
  }, [customer]);

  const fetchSavedAddresses = async (customerId) => {
    try {
      const res = await axios.get(`${API}/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const addrs = res.data?.ShippingAddresses || [];
      setSavedAddresses(addrs);
    } catch {
      setSavedAddresses([]);
    }
  };

  // ── Fetch shipping charge whenever state changes ─────────
  const fetchShippingCharge = useCallback(async (state) => {
    if (!state) {
      setShippingCharge(0);
      return;
    }
    setShippingLoading(true);
    try {
      const res = await axios.get(`${API}/shipping/rate`, { params: { state } });
      setShippingCharge(res.data.amount || 0);
    } catch {
      setShippingCharge(0); // fallback: free
    } finally {
      setShippingLoading(false);
    }
  }, []);
  // ────────────────────────────────────────────────────────

  useEffect(() => {
    if (totalPrice > 0) {
      axios.get(`${API}/coupons/list?orderAmount=${totalPrice}`)
        .then(res => setAvailableCoupons(res.data))
        .catch(() => setAvailableCoupons([]));
    }
  }, [totalPrice]);

  const handleSelectSavedAddr = (addr) => {
    if (addr === null) {
      setSelectedAddrId(null);
      setShippingAddr({
        name:  customer?.name  || '',
        phone: customer?.phone || '',
        addressLine: '', city: '', state: '', pincode: '', district: '',
      });
      setDistricts([]);
      setShippingCharge(0); // reset shipping when address cleared
      return;
    }
    setSelectedAddrId(addr.id);
    const sel = statesData.find(s => s.state === addr.state);
    setDistricts(sel ? sel.districts : []);
    const newAddr = {
      name:        addr.name        || customer?.name  || '',
      phone:       addr.phone       || customer?.phone || '',
      addressLine: addr.addressLine || '',
      city:        addr.city        || '',
      state:       addr.state       || '',
      pincode:     addr.pincode     || '',
      district:    addr.district    || '',
    };
    setShippingAddr(newAddr);
    fetchShippingCharge(addr.state); // ← fetch charge for selected address state
  };

  const handleAddrChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === 'name')    filtered = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'phone')   filtered = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'pincode') filtered = value.replace(/\D/g, '').slice(0, 6);

    if (name === 'state') {
      const sel = statesData.find(s => s.state === filtered);
      setDistricts(sel ? sel.districts : []);
      setShippingAddr(prev => ({ ...prev, state: filtered, district: '' }));
      fetchShippingCharge(filtered); // ← fetch charge on state dropdown change
    } else {
      setShippingAddr(prev => ({ ...prev, [name]: filtered }));
    }
    setSelectedAddrId(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    try {
      const res = await axios.post(`${API}/coupons/validate`, { code: couponCode, orderAmount: totalPrice });
      if (res.data.success) {
        const { discountAmount, couponId, code } = res.data.data;
        setDiscount(discountAmount);
        setAppliedCouponId(couponId);
        setAppliedCouponCode(code || couponCode);
        toast.success(res.data.message);
      }
    } catch (err) {
      setDiscount(0); setAppliedCouponId(null); setAppliedCouponCode('');
      toast.error(err.response?.data?.message || 'Invalid Coupon Code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0); setAppliedCouponId(null); setAppliedCouponCode(''); setCouponCode('');
    toast('Coupon Removed 🗑️');
  };

  const handleSuggestionClick = async (code) => {
    if (isValidating) return;
    setCouponCode(code);
    setIsValidating(true);
    try {
      const res = await axios.post(`${API}/coupons/validate`, { code, orderAmount: totalPrice });
      if (res.data.success) {
        const { discountAmount, couponId } = res.data.data;
        setDiscount(discountAmount); setAppliedCouponId(couponId); setAppliedCouponCode(code);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not apply coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const { name, phone, addressLine, city, state, pincode, district } = shippingAddr;
    const nameRegex    = /^[a-zA-Z\s]+$/;
    const phoneRegex   = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;

    if (!name || !nameRegex.test(name.trim()))
      return toast.error('Full name must contain only letters and spaces.');
    if (!phone || !phoneRegex.test(phone.trim()))
      return toast.error('Phone number must be exactly 10 digits.');
    if (!addressLine.trim())
      return toast.error('Address is required.');
    if (!city.trim())
      return toast.error('City is required.');
    if (!state)
      return toast.error('State is required.');
    if (!pincode || !pincodeRegex.test(pincode.trim()))
      return toast.error('PIN Code must be exactly 6 digits.');
    if (districts.length > 0 && !district)
      return toast.error('Please select a district.');

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setPlacing(true);
    try {
      const { data: addrData } = await axios.post(
        `${API}/customers/add-shipping`,
        { customerId: customer.id, ...shippingAddr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const shippingAddressId = addrData?.address?.id || null;

      if (!shippingAddressId) {
        toast.error('Could not save delivery address. Please try again.');
        setPlacing(false);
        return;
      }

      const { data: razorpayData } = await axios.post(
        `${API}/payment/create-order`,
        { amount: finalAmount * 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rzpOrder = razorpayData.order;

      const options = {
        key:         process.env.REACT_APP_RAZORPAY_KEY || '',
        amount:      rzpOrder.amount,
        currency:    'INR',
        name:        'ARS Fashion World',
        description: 'Order Payment',
        order_id:    rzpOrder.id,
        prefill: {
          name:    customer?.name  || '',
          email:   customer?.email || '',
          contact: customer?.phone || '',
        },
        theme: { color: '#1a1aff', backdrop_color: 'rgba(0,4,74,0.85)' },

        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              const orderItems = cartItems.map(item => ({
                productId:    item.id,
                variantId:    item.variantId    || null,
                quantity:     item.quantity,
                salesPrice:   Number(item.price),
                productName:  item.name         || null,
                productImage: item.mainImage    || item.img || null,
                variantLabel: item.variantLabel || null,
              }));

              const orderRes = await axios.post(
                `${API}/orders/place`,
                {
                  customerId:        customer.id,
                  totalAmount:       finalAmount,      // includes shipping
                  discountAmount:    discount,
                  shippingAmount:    shippingCharge,   // ← NEW field
                  couponId:          appliedCouponId,
                  paymentMethod:     'Online',
                  paymentId:         response.razorpay_payment_id,
                  razorpayOrderId:   response.razorpay_order_id,
                  shippingAddressId: shippingAddressId,
                  items:             orderItems,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (clearCart) clearCart();
              navigate('/order-confirmation', {
                state: {
                  orderId:        orderRes.data?.order?.id || orderRes.data?.orderId || '',
                  customerName:   customer.name,
                  totalAmount:    finalAmount,
                  shippingCharge, // pass to confirmation page if needed
                }
              });
            }
          } catch (err) {
            toast.error(
              err.response?.data?.error   ||
              err.response?.data?.message ||
              err.message                 ||
              'Order failed. Please contact support.'
            );
            setPlacing(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast('Payment cancelled ⚠️');
            setPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPlacing(false);
      });

      setShowConfirmModal(false);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Something went wrong. Try again.');
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page-wrapper">
        <div className="empty-checkout-flow">
          <h2>Your Cart is Empty</h2>
          <button className="back-shop-btn" onClick={() => navigate('/shop')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">

      <OrderConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmOrder}
        shippingAddr={shippingAddr}
        finalAmount={finalAmount}
        cartItems={cartItems}
        placing={placing}
        shippingCharge={shippingCharge}
      />

      <div className="checkout-main-container">
        <form id="checkout-form" onSubmit={handlePlaceOrder}>

          {/* ══ LEFT PANEL ══ */}
          <div className="checkout-left-panel">
            <header className="checkout-brand-header">
              <h2 className="brand-logo">ARS Fashion</h2>
              <p className="login-text">Checking out as <strong>{customer?.name}</strong></p>
            </header>

            <section className="form-group-section">
              <h3 className="section-title">Contact</h3>
              <input type="text"  className="styled-input" value={customer?.phone || ''} readOnly placeholder="Phone number" />
              <input type="email" className="styled-input" value={customer?.email || ''} readOnly placeholder="Email" />
            </section>

            <section className="form-group-section">
              <h3 className="section-title">Delivery Address</h3>
              <div className="co-saved-addr-list">
                <div
                  className={`co-saved-addr-card new-addr-btn ${selectedAddrId === null ? 'selected' : ''}`}
                  onClick={() => handleSelectSavedAddr(null)}
                >
                  <div className="co-saved-addr-check">{selectedAddrId === null ? '✓' : '+'}</div>
                  <div className="co-saved-addr-info">
                    <span className="co-saved-addr-name">Add New Address</span>
                    <span className="co-saved-addr-line">Enter a different delivery location</span>
                  </div>
                </div>

                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`co-saved-addr-card ${selectedAddrId === addr.id ? 'selected' : ''}`}
                    onClick={() => handleSelectSavedAddr(addr)}
                  >
                    <div className="co-saved-addr-check">{selectedAddrId === addr.id ? '✓' : ''}</div>
                    <div className="co-saved-addr-info">
                      <span className="co-saved-addr-name">{addr.name}</span>
                      <span className="co-saved-addr-line">
                        {addr.addressLine}, {addr.city}
                        {addr.district ? `, ${addr.district}` : ''}, {addr.state} — {addr.pincode}
                      </span>
                      <span className="co-saved-addr-phone">{addr.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
              {(selectedAddrId || savedAddresses.length > 0) && (
                <p className="co-edit-hint">✏️ You can edit any field below to update details</p>
              )}
            </section>

            <section className="form-group-section">
              <h3 className="section-title">
                {selectedAddrId ? 'Edit Delivery Details' : 'Shipping Details'}
              </h3>
              <div className="co-new-addr">
                <input
                  name="name" type="text" placeholder="Full Name (letters only) *"
                  className="styled-input" value={shippingAddr.name} onChange={handleAddrChange}
                  onKeyPress={(e) => { if (/[^a-zA-Z\s]/.test(e.key)) e.preventDefault(); }}
                />
                <input
                  name="phone" type="tel" placeholder="Phone Number *"
                  className="styled-input" value={shippingAddr.phone} onChange={handleAddrChange} maxLength={10}
                />
                <input
                  name="addressLine" type="text" placeholder="House No, Street / Area / Landmark *"
                  className="styled-input" value={shippingAddr.addressLine} onChange={handleAddrChange}
                />
                <div className="dual-input-row">
                  <input
                    name="city" type="text" placeholder="City *"
                    className="styled-input" value={shippingAddr.city} onChange={handleAddrChange}
                  />
                  <input
                    name="pincode" type="text" placeholder="PIN Code *"
                    className="styled-input" value={shippingAddr.pincode} onChange={handleAddrChange} maxLength={6}
                  />
                </div>

                <select name="state" className="styled-input" value={shippingAddr.state} onChange={handleAddrChange}>
                  <option value="">Select State *</option>
                  {statesData.map(s => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>

                {districts.length > 0 && (
                  <select name="district" className="styled-input animated-slide-down" value={shippingAddr.district} onChange={handleAddrChange}>
                    <option value="">Select District *</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                )}

                {/* ── Shipping charge preview ── */}
                {shippingAddr.state && (
                  <div className="co-shipping-preview">
                    <span>🚚 Shipping to <strong>{shippingAddr.state}</strong>:</span>
                    {shippingLoading ? (
                      <span className="co-shipping-loading">Checking…</span>
                    ) : shippingCharge === 0 ? (
                      <span className="co-shipping-free">FREE</span>
                    ) : (
                      <span className="co-shipping-amount">₹{shippingCharge.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                )}

                <p className="co-new-addr-note">
                  📦 Delivery available across all Indian states. Standard delivery in 3–7 business days.
                </p>
              </div>
            </section>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="checkout-right-panel">
            <div className="order-summary-box">
              <div className="summary-header"><h3>Order Summary</h3></div>
              <div className="summary-body">

                <div className="product-list-scroll">
                  {cartItems.map(item => {
                    const price = Number(item.price);
                    return (
                      <div className="summary-item-row" key={item.cartItemId || item.id}>
                        <div className="item-img-wrapper">
                          <img
                            src={getImg(item)} alt={item.name}
                            onError={e => { e.target.src = '/assets/placeholder.png'; }}
                          />
                          <span className="quantity-tag">{item.quantity}</span>
                        </div>
                        <div className="item-description">
                          <p className="name">{item.name}</p>
                          <p className="variant">₹{price.toLocaleString('en-IN')} each</p>
                        </div>
                        <div className="item-final-price">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon block */}
                <div className="coupon-apply-block">
                  <input
                    type="text" placeholder="DISCOUNT CODE"
                    value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="coupon-input" disabled={discount > 0}
                  />
                  {discount > 0 ? (
                    <button type="button" onClick={handleRemoveCoupon} className="apply-btn ready remove-btn">Remove</button>
                  ) : (
                    <button
                      type="button" onClick={handleApplyCoupon}
                      className={`apply-btn ${couponCode ? 'ready' : ''}`}
                      disabled={!couponCode || isValidating}
                    >
                      {isValidating ? '...' : 'Apply'}
                    </button>
                  )}
                </div>

                {discount > 0 && appliedCouponCode && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#e8f5e9', border: '1px solid #a5d6a7',
                    borderRadius: 6, padding: '6px 12px', marginBottom: 8, fontSize: 13,
                  }}>
                    <span style={{ color: '#2e7d32', fontWeight: 700 }}>✅ {appliedCouponCode}</span>
                    <span style={{ color: '#388e3c' }}>applied — saving ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {availableCoupons.length > 0 && discount === 0 && (
                  <div className="coupon-suggestions">
                    <p className="coupon-suggestions-title">🏷️ Available Coupons</p>
                    {availableCoupons.map(c => {
                      const usageLeft = c.usageLimit - (c.usedCount || 0);
                      return (
                        <div
                          key={c.code}
                          className={`coupon-suggestion-tag ${isValidating ? 'loading' : ''}`}
                          onClick={() => handleSuggestionClick(c.code)}
                        >
                          <div className="coupon-suggestion-left">
                            <span className="coupon-suggestion-code">{c.code}</span>
                            {c.description && <span className="coupon-suggestion-desc">{c.description}</span>}
                            {c.maxOrderAmount ? (
                              <span className="coupon-suggestion-range">
                                Valid ₹{parseFloat(c.minOrderAmount).toLocaleString('en-IN')} –{' '}
                                ₹{parseFloat(c.maxOrderAmount).toLocaleString('en-IN')}
                              </span>
                            ) : (c.minOrderAmount > 0 && (
                              <span className="coupon-suggestion-range">
                                Min ₹{parseFloat(c.minOrderAmount).toLocaleString('en-IN')}
                              </span>
                            ))}
                            {usageLeft <= 10 && (
                              <span style={{ fontSize: 11, color: '#e53935', fontWeight: 600 }}>
                                ⚡ Only {usageLeft} left!
                              </span>
                            )}
                          </div>
                          <span className="coupon-tap-arrow">→</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Calculation block with shipping ── */}
                <div className="calculation-block">
                  <div className="calc-row">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="calc-row">
                    <span>
                      Shipping
                      {shippingAddr.state ? ` (${shippingAddr.state})` : ''}
                    </span>
                    {shippingLoading ? (
                      <span style={{ color: '#999', fontSize: 12 }}>Checking…</span>
                    ) : shippingCharge === 0 ? (
                      <span className="free-shipping">FREE</span>
                    ) : (
                      <span style={{ color: '#e65100', fontWeight: 600 }}>
                        +₹{shippingCharge.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="calc-row discount-text">
                      <span>Coupon Discount</span>
                      <span>−₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="final-total-row">
                  <span className="label">Total</span>
                  <div className="total-price-col">
                    <small>INR</small>
                    <span className="main-price">₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
            </div>

            <button type="submit" className="proceed-checkout-btn" disabled={placing}>
              {placing ? 'Opening Payment…' : 'Place Order →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;