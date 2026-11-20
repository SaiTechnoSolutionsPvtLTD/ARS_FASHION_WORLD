import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RiEyeLine, RiEditLine, RiDeleteBin6Line, RiCloseLine, RiCheckLine, RiCloseFill } from "react-icons/ri";
import { FaSearch, FaCommentDots, FaStar } from "react-icons/fa";
import { MdPendingActions, MdPublic, MdBlock } from "react-icons/md";
import './ReviewPage.css';
import { API, IMG } from '../config';

/* ── Star display ── */
const StarDisplay = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(n => (
      <FaStar key={n} style={{ color: n <= rating ? '#d1a309' : '#ddd', fontSize: 14 }} />
    ))}
  </div>
);

/* ── Status badge ── */
const StatusPill = ({ status }) => {
  const map = {
    pending:   { bg: '#fff8e6', color: '#a07e07', icon: <MdPendingActions />, label: 'Pending'   },
    published: { bg: '#e8f5e9', color: '#2e7d32', icon: <MdPublic />,         label: 'Published' },
    rejected:  { bg: '#fdecea', color: '#c62828', icon: <MdBlock />,          label: 'Rejected'  },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color
    }}>
      {s.icon} {s.label}
    </span>
  );
};

/* ── Custom Confirm Dialog ── */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="pp-confirm-overlay">
    <div className="pp-confirm-box">
      <div className="pp-confirm-icon">🗑</div>
      <p className="pp-confirm-msg">{message}</p>
      <div className="pp-confirm-actions">
        <button className="pp-confirm-cancel" onClick={onCancel}>Cancel</button>
        <button className="pp-confirm-ok" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const ReviewPage = () => {
  const [reviews, setReviews]               = useState([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalType, setModalType]           = useState(null);
  const [editFeedback, setEditFeedback]     = useState('');
  const [loading, setLoading]               = useState(true);

  // ── Confirm dialog state ──
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmMsg, setConfirmMsg]       = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews/all`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  // ── Confirm helpers ──
  const showConfirm = (message, action) => {
    setConfirmMsg(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };
  const handleConfirmYes = () => { setConfirmOpen(false); confirmAction?.(); };
  const handleConfirmNo  = () => { setConfirmOpen(false); setConfirmAction(null); };

  // ✅ alert → toast
  const handleUpdate = async (id, status, feedback) => {
    try {
      await axios.put(`${API}/reviews/update/${id}`, { status, feedback });
      const labels = { published: 'published ', rejected: 'rejected ', pending: 'reset to pending ' };
      toast.success(`Review ${labels[status] || 'updated'} successfully!`);
      setModalType(null);
      setSelectedReview(null);
      fetchReviews();
    } catch (err) {
      toast.error('Update failed. Please check your connection.');
    }
  };

  // ✅ window.confirm → custom dialog + toast
  const handleDelete = (id) => {
    showConfirm(
      'Delete this review? This cannot be undone.',
      async () => {
        try {
          await axios.delete(`${API}/reviews/delete/${id}`);
          toast.success('Review deleted successfully! ');
          fetchReviews();
        } catch (err) {
          toast.error('Delete failed: ' + (err.response?.data?.message || err.message));
        }
      }
    );
  };

  const filtered = reviews.filter(r => {
    const matchSearch =
      r.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:       reviews.length,
    pending:   reviews.filter(r => r.status === 'pending').length,
    published: reviews.filter(r => r.status === 'published').length,
    rejected:  reviews.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="ars-rvw-main-container">

      {/*  Confirm dialog */}
      {confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}

      {/* ── Header ── */}
      <div className="ars-rvw-header-section">
        <div className="ars-rvw-title-block">
          <h1>Customer Reviews</h1>
          <p>Moderation &amp; Feedback Management</p>
        </div>
        <div className="ars-rvw-header-controls">
          <div className="ars-rvw-search-bar">
            <FaSearch className="ars-rvw-search-icon" />
            <input
              type="text"
              placeholder="Search by customer, product or content..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="ars-rvw-filter-tabs">
        {[
          { key: 'all',       label: `All (${counts.all})`             },
          { key: 'pending',   label: `Pending (${counts.pending})`     },
          { key: 'published', label: `Published (${counts.published})` },
          { key: 'rejected',  label: `Rejected (${counts.rejected})`   },
        ].map(tab => (
          <button
            key={tab.key}
            className={`ars-rvw-tab ${filterStatus === tab.key ? 'active' : ''} ${tab.key}`}
            onClick={() => setFilterStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="ars-rvw-table-card">
        {loading ? (
          <div className="ars-rvw-empty-state">
            <div className="ars-rvw-spinner" />
            <p>Loading reviews…</p>
          </div>
        ) : (
          <table className="ars-rvw-data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Status</th>
                <th className="ars-rvw-text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="ars-rvw-product-cell">
                      {r.productInfo?.mainImage ? (
                        <img src={`${IMG}${r.productInfo.mainImage}`} alt={r.productInfo.name}
                          className="ars-rvw-product-thumb"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="ars-rvw-product-thumb ars-rvw-thumb-placeholder">
                          <FaCommentDots />
                        </div>
                      )}
                      <span className="ars-rvw-product-name">{r.productInfo?.name || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ars-rvw-customer-name">{r.customerInfo?.name || '—'}</div>
                    <div className="ars-rvw-customer-email">{r.customerInfo?.email || ''}</div>
                  </td>
                  <td>
                    <StarDisplay rating={Number(r.rating) || 5} />
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{r.rating}/5</div>
                  </td>
                  <td>
                    <div className="ars-rvw-text-truncate" title={r.feedback}>{r.feedback}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#666' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td><StatusPill status={r.status} /></td>
                  <td>
                    <div className="ars-rvw-action-group">
                      <button className="ars-rvw-icon-btn ars-rvw-view" title="View & Moderate"
                        onClick={() => { setSelectedReview(r); setModalType('view'); }}>
                        <RiEyeLine />
                      </button>
                      <button className="ars-rvw-icon-btn ars-rvw-edit" title="Edit Feedback"
                        onClick={() => { setSelectedReview(r); setEditFeedback(r.feedback); setModalType('edit'); }}>
                        <RiEditLine />
                      </button>
                      {/* ✅ custom confirm + toast */}
                      <button className="ars-rvw-icon-btn ars-rvw-delete" title="Delete"
                        onClick={() => handleDelete(r.id)}>
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7">
                    <div className="ars-rvw-empty-state">
                      <FaCommentDots />
                      <h3>No reviews found</h3>
                      <p>Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalType && selectedReview && (
        <div className="ars-rvw-modal-backdrop">
          <div className="ars-rvw-modal-content">
            <div className="ars-rvw-modal-header">
              <h2>{modalType === 'view' ? 'Review Details' : 'Edit Feedback'}</h2>
              <button className="ars-rvw-close-btn" onClick={() => setModalType(null)}>
                <RiCloseLine />
              </button>
            </div>

            <div className="ars-rvw-modal-body">
              {modalType === 'view' ? (
                <div className="ars-rvw-view-layout">
                  {selectedReview.productInfo && (
                    <div className="ars-rvw-modal-product-card">
                      {selectedReview.productInfo.mainImage && (
                        <img src={`${IMG}${selectedReview.productInfo.mainImage}`}
                          alt={selectedReview.productInfo.name}
                          className="ars-rvw-modal-product-img"
                          onError={e => { e.target.style.display = 'none'; }} />
                      )}
                      <div>
                        <div className="ars-rvw-modal-product-label">Reviewed Product</div>
                        <div className="ars-rvw-modal-product-name">{selectedReview.productInfo.name}</div>
                      </div>
                    </div>
                  )}
                  <div className="ars-rvw-modal-row">
                    <label>Reviewer</label>
                    <p className="ars-rvw-focus-text">{selectedReview.customerInfo?.name}</p>
                  </div>
                  <div className="ars-rvw-modal-row">
                    <label>Rating</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarDisplay rating={Number(selectedReview.rating) || 5} />
                      <span style={{ fontSize: 13, color: '#666' }}>
                        {['','Poor','Fair','Good','Very Good','Excellent'][Number(selectedReview.rating)] || ''}
                      </span>
                    </div>
                  </div>
                  <div className="ars-rvw-modal-row">
                    <label>Current Status</label>
                    <StatusPill status={selectedReview.status} />
                  </div>
                  <div className="ars-rvw-modal-row">
                    <label>Feedback</label>
                    <div className="ars-rvw-feedback-display">{selectedReview.feedback}</div>
                  </div>
                  <div className="ars-rvw-modal-row">
                    <label>Submitted On</label>
                    <p style={{ margin: 0, color: '#555', fontSize: 13 }}>
                      {new Date(selectedReview.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  {/* ✅ Action buttons — toast on click */}
                  <div className="ars-rvw-button-stack">
                    {selectedReview.status !== 'published' && (
                      <button className="ars-rvw-btn-primary-green"
                        onClick={() => handleUpdate(selectedReview.id, 'published', selectedReview.feedback)}>
                        <RiCheckLine style={{ marginRight: 6 }} />
                        Approve &amp; Publish
                      </button>
                    )}
                    {selectedReview.status !== 'rejected' && (
                      <button className="ars-rvw-btn-danger"
                        onClick={() => handleUpdate(selectedReview.id, 'rejected', selectedReview.feedback)}>
                        <RiCloseFill style={{ marginRight: 6 }} />
                        Reject Review
                      </button>
                    )}
                    {selectedReview.status !== 'pending' && (
                      <button className="ars-rvw-btn-gold-full"
                        onClick={() => handleUpdate(selectedReview.id, 'pending', selectedReview.feedback)}>
                        <MdPendingActions style={{ marginRight: 6 }} />
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ars-rvw-edit-layout">
                  {selectedReview.productInfo && (
                    <div className="ars-rvw-modal-product-card">
                      {selectedReview.productInfo.mainImage && (
                        <img src={`${IMG}${selectedReview.productInfo.mainImage}`}
                          alt={selectedReview.productInfo.name}
                          className="ars-rvw-modal-product-img"
                          onError={e => { e.target.style.display = 'none'; }} />
                      )}
                      <div>
                        <div className="ars-rvw-modal-product-label">Product</div>
                        <div className="ars-rvw-modal-product-name">{selectedReview.productInfo.name}</div>
                      </div>
                    </div>
                  )}
                  <div className="ars-rvw-modal-row">
                    <label>Rating</label>
                    <StarDisplay rating={Number(selectedReview.rating) || 5} />
                  </div>
                  <div className="ars-rvw-modal-row">
                    <label>Edit Feedback Content</label>
                    <textarea className="ars-rvw-textarea-input"
                      value={editFeedback}
                      onChange={e => setEditFeedback(e.target.value)} />
                  </div>
                  <div className="ars-rvw-button-stack">
                    {/* ✅ save feedback toast */}
                    <button className="ars-rvw-btn-gold-full"
                      onClick={() => handleUpdate(selectedReview.id, selectedReview.status, editFeedback)}>
                      Save &amp; Apply Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewPage;
