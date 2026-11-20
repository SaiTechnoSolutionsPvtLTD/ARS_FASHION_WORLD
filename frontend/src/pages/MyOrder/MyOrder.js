import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MdShoppingBag,
  MdChevronRight,
  MdClose,
  MdStar,
  MdStarBorder,
  MdCheckCircle,
  MdLocalShipping,
  MdAccessTime,
  MdCancel,
  MdRateReview,
  MdStorefront,
} from 'react-icons/md';
import './MyOrder.css';

import { API, IMG as IMG_BASE } from '../../config';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const statusMeta = (status) => {
  switch (status) {
    case 'Delivered':        return { bg: '#e6f4ec', color: '#1a7a3f', Icon: MdCheckCircle };
    case 'Shipped':
    case 'Out for Delivery': return { bg: '#e8e9f5', color: '#3a3f8f', Icon: MdLocalShipping };
    case 'Confirmed':        return { bg: '#fdf3d0', color: '#a07e07', Icon: MdAccessTime };
    case 'Cancelled':        return { bg: '#fdecea', color: '#d32f2f', Icon: MdCancel };
    default:                 return { bg: '#fdf3d0', color: '#a07e07', Icon: MdAccessTime };
  }
};

/* ── Star Rating Component ── */
const StarRating = ({ rating, setRating, readOnly = false }) => (
  <div className="mo-stars">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        className={`mo-star-btn ${n <= rating ? 'filled' : ''}`}
        onClick={() => !readOnly && setRating(n)}
        disabled={readOnly}
      >
        {n <= rating
          ? <MdStar className="mo-star filled" />
          : <MdStarBorder className="mo-star" />}
      </button>
    ))}
    {rating > 0 && (
      <span className="mo-star-label">
        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
      </span>
    )}
  </div>
);

const MyOrders = () => {
  const { customer, isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  /* Review modal state */
  const [reviewModal, setReviewModal]           = useState(false);
  const [reviewOrder, setReviewOrder]           = useState(null);
  const [reviewRating, setReviewRating]         = useState(0);
  const [reviewText, setReviewText]             = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchOrders();
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${API}/orders/customer/${customer.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) =>
    setExpandedId(prev => (prev === id ? null : id));

  const getStepIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  /* ── Open review modal ── */
  const openReview = (order) => {
    setReviewOrder(order);
    setReviewRating(0);
    setReviewText('');
    setReviewModal(true);
  };

  /* ── Submit review ── */
  const handleSubmitReview = async () => {
    if (reviewRating === 0) { toast.error('Please select a star rating'); return; }
    if (!reviewText.trim()) { toast.error('Please write your feedback'); return; }
    

    const orderItems = reviewOrder.items || reviewOrder.OrderItems || [];
    const firstItem  = orderItems[0];
    const productId  = firstItem?.productId || firstItem?.Product?.id || null;
     console.log('DEBUG reviewOrder:', reviewOrder);  // ← இதை add பண்ணுங்க
    console.log('DEBUG orderId being sent:', reviewOrder.id);  // ← இதையும்

    setSubmittingReview(true);
    try {
      await axios.post(`${API}/reviews/create`, {
        customerId: customer.id,
        orderId:    reviewOrder.id,
        productId,
        rating:     reviewRating,
        feedback:   reviewText.trim(),
      });
      toast.success('Thank you for your review! 🌟');
      setReviewModal(false);
      fetchOrders(); // re-fetch so hasReview reflects correctly from backend
    } catch (err) {
      if (err.response?.status === 409) {
        // Already reviewed — close modal and refresh so button disappears
        setReviewModal(false);
        fetchOrders();
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const initials = customer?.name
    ? customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  if (loading) {
    return (
      <div className="mo-loading-page">
        <div className="mo-spinner" />
        <p>Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="mo-page">

      {/* ══ BANNER ══ */}
      <div className="mo-banner">
        <div className="mo-banner-wave" />
        <div className="mo-banner-inner">
          <div className="mo-avatar-big">{initials}</div>
          <div>
            <div className="mo-logo-label">ARS Fashion World</div>
            <h1 className="mo-banner-title">My Orders</h1>
            <p className="mo-banner-sub">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="mo-body">

        {orders.length === 0 ? (
          <div className="mo-empty-card">
            <MdShoppingBag className="mo-empty-icon" />
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here.</p>
            <button className="mo-shop-btn" onClick={() => navigate('/shop')}>
              <MdStorefront style={{ marginRight: 8 }} />Shop Now
            </button>
          </div>
        ) : (
          <div className="mo-list">
            {orders.map((order, idx) => {
              const isOpen      = expandedId === order.id;
              const stepIndex   = getStepIndex(order.status);
              const isCancelled = order.status === 'Cancelled';
              const isDelivered = order.status === 'Delivered';
              const { bg, color, Icon: StatusIcon } = statusMeta(order.status);
              const alreadyReviewed = order.hasReview;

              return (
                <div
                  key={order.id}
                  className={`mo-card ${isOpen ? 'mo-card-open' : ''}`}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  {/* ── Card Header ── */}
                  <div className="mo-card-header" onClick={() => toggleExpand(order.id)}>
                    <div className="mo-card-left">
                      <span className="mo-order-num">
                        <MdShoppingBag className="mo-order-icon" />
                        Order #{order.id}
                      </span>
                      <span className="mo-order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="mo-card-right">
                      <span className="mo-status-badge" style={{ background: bg, color }}>
                        <StatusIcon style={{ fontSize: 12, marginRight: 4, verticalAlign: 'middle' }} />
                        {order.status}
                      </span>
                      <span className="mo-amount">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                      <MdChevronRight className={`mo-chevron ${isOpen ? 'open' : ''}`} />
                    </div>
                  </div>

                  {/* ── Expanded Details ── */}
                  {isOpen && (
                    <div className="mo-card-body">

                      {/* Progress Tracker */}
                      {!isCancelled && (
                        <div className="mo-section">
                          <div className="mo-section-label">Order Progress</div>
                          <div className="mo-tracker">
                            {STATUS_STEPS.map((step, i) => (
                              <React.Fragment key={step}>
                                <div className={`mo-step ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}>
                                  <div className="mo-step-dot">
                                    {i < stepIndex && (
                                      <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                    {i === stepIndex && <div className="mo-step-pulse" />}
                                  </div>
                                  <span className="mo-step-label">{step}</span>
                                </div>
                                {i < STATUS_STEPS.length - 1 && (
                                  <div className={`mo-step-line ${i < stepIndex ? 'done' : ''}`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="mo-cancelled-banner">
                          <MdCancel style={{ marginRight: 8, verticalAlign: 'middle' }} />
                          This order was cancelled
                        </div>
                      )}

                      {/* Items */}
                      <div className="mo-section">
                        <div className="mo-section-label">Items Ordered</div>
                        <div className="mo-items">
                          {(order.items || order.OrderItems || []).map((item, i) => (
                            <div key={i} className="mo-item-row">
                              {/*  Product thumbnail */}
                              {item.productImage && (
                                <img
                                  src={`${IMG_BASE}${item.productImage}`}
                                  alt={item.productName}
                                  className="mo-item-thumb"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              )}
                              <div className="mo-item-info">
                                <span className="mo-item-name">
                                  {item.productName || item.Product?.name || `Product #${item.productId}`}
                                </span>
                                <span className="mo-item-qty">Qty: {item.quantity}</span>
                              </div>
                              <span className="mo-item-price">
                                ₹{Number(item.salesPrice).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="mo-price-summary">
                        {order.discountAmount > 0 && (
                          <div className="mo-price-row">
                            <span>Discount</span>
                            <span className="mo-discount">
                              −₹{Number(order.discountAmount).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        <div className="mo-price-row mo-price-total">
                          <span>Total Paid</span>
                          <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="mo-price-row" style={{ paddingTop: 6 }}>
                          <span>Payment</span>
                          <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                            {order.paymentMethod || 'Online'}
                          </span>
                        </div>
                      </div>

                      {/* ── REVIEW SECTION (only for Delivered orders) ── */}
                      {isDelivered && (
                        <div className="mo-review-zone">
                          {alreadyReviewed ? (
                            <div className="mo-review-done">
                              <MdCheckCircle style={{ color: '#1a7a3f', fontSize: 20, marginRight: 8 }} />
                              Review submitted — pending admin approval before it goes live!
                            </div>
                          ) : (
                            <>
                              <div className="mo-review-zone-label">
                                <MdRateReview style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }} />
                                How was your experience?
                              </div>
                              <button className="mo-review-btn" onClick={() => openReview(order)}>
                                <MdStar style={{ marginRight: 6 }} />Add Review
                              </button>
                            </>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ REVIEW MODAL ══ */}
      {reviewModal && reviewOrder && (
        <div className="mo-modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="mo-modal" onClick={e => e.stopPropagation()}>

            <div className="mo-modal-hdr">
              <div>
                <div className="mo-modal-title">Write a Review</div>
                <div className="mo-modal-sub">Order #{reviewOrder.id}</div>
              </div>
              <button className="mo-modal-close" onClick={() => setReviewModal(false)}>
                <MdClose />
              </button>
            </div>

            <div className="mo-modal-body">

              {/*  Items preview with product thumbnail */}
              {(reviewOrder.items || reviewOrder.OrderItems || []).length > 0 && (
                <div className="mo-modal-products">
                  {(reviewOrder.items || reviewOrder.OrderItems || []).map((item, i) => (
                    <div key={i} className="mo-modal-product-row">
                      {item.productImage ? (
                        <img
                          src={`${IMG_BASE}${item.productImage}`}
                          alt={item.productName}
                          className="mo-modal-product-img"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="mo-modal-product-img-placeholder">
                          <MdShoppingBag />
                        </div>
                      )}
                      <div className="mo-modal-product-info">
                        <span className="mo-modal-product-name">
                          {item.productName || `Product #${item.productId}`}
                        </span>
                        <span className="mo-modal-product-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Star Rating */}
              <div className="mo-modal-field">
                <label className="mo-modal-label">Your Rating</label>
                <StarRating rating={reviewRating} setRating={setReviewRating} />
              </div>

              {/* Feedback Text */}
              <div className="mo-modal-field">
                <label className="mo-modal-label">Your Feedback</label>
                <textarea
                  className="mo-modal-textarea"
                  placeholder="Tell us about your experience — product quality, delivery, packaging…"
                  rows={5}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  maxLength={500}
                />
                <div className="mo-textarea-count">{reviewText.length}/500</div>
              </div>

            </div>

            <div className="mo-modal-footer">
              <button
                className="mo-modal-submit"
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                <MdStar style={{ marginRight: 6 }} />
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
              <button className="mo-modal-cancel" onClick={() => setReviewModal(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrders;