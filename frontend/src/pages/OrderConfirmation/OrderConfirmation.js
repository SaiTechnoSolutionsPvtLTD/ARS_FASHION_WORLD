import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);

  const { orderId, customerName, totalAmount } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setShow(true), 100);
  }, []);

  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 7 + 4,
    left: Math.random() * 100,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
    color: ['#00044a','#d1a309','#c084fc','#e8e9f5','#fdf3d0'][i % 5],
  }));

  return (
    <div className="oc-wrapper">

      {/* Background orbs */}
      <div className="oc-orb oc-orb-1" />
      <div className="oc-orb oc-orb-2" />
      <div className="oc-orb oc-orb-3" />

      {/* Confetti */}
      {dots.map(d => (
        <div
          key={d.id}
          className="oc-dot"
          style={{
            width: d.size, height: d.size,
            left: `${d.left}%`,
            background: d.color,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}

      <div className={`oc-card ${show ? 'oc-visible' : ''}`}>

        {/* Animated Checkmark */}
        <div className="oc-icon-ring">
          <svg className="oc-check-svg" viewBox="0 0 52 52">
            <circle className="oc-circle" cx="26" cy="26" r="25" fill="none" />
            <path   className="oc-tick"   fill="none" d="M14 27 l8 8 l16-16" />
          </svg>
        </div>

        {/* Badge */}
        <div className="oc-badge">
          <span className="oc-badge-dot" />
          Order Placed
        </div>

        {/* Message */}
        <p className="oc-greeting">Hey {customerName || 'Valued Customer'},</p>
        <h1 className="oc-headline">
          Your Order is <span>Confirmed!</span>
        </h1>
        <p className="oc-subtext">
          We'll send you a shipping confirmation as soon as your order is on its way.
          Thank you for shopping with us!
        </p>

        {/* Info boxes */}
        <div className="oc-info-boxes">
          {orderId && (
            <div className="oc-order-id-box">
              <span className="oc-order-label">Order ID</span>
              <span className="oc-order-value">
                <span className="oc-order-id-prefix">#</span>{orderId}
              </span>
            </div>
          )}
          {totalAmount && (
            <div className="oc-amount-box">
              <span className="oc-order-label">Amount Paid</span>
              <span className="oc-order-value">
                ₹{Number(totalAmount).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="oc-divider"><span>what's next</span></div>

        {/* Actions */}
        <div className="oc-actions">
          <button className="oc-btn-primary" onClick={() => navigate('/my-orders')}>
            Check Order Status
          </button>
          <button className="oc-btn-secondary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>

        {/* Trust Strip */}
        <div className="oc-trust">
          <div className="oc-trust-item">
            <div className="oc-trust-icon green">✓</div>
            Payment Secured
          </div>
          <div className="oc-trust-item">
            <div className="oc-trust-icon blue">⟳</div>
            Easy Returns
          </div>
          <div className="oc-trust-item">
            <div className="oc-trust-icon green">✓</div>
            Free Shipping
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;