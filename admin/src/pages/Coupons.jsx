import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash } from "react-icons/fa";
import './ProductPage.css';
import './Coupons.css';

import { API } from '../config';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const expiryCheckRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    discountValue: '',
    minOrderAmount: 0,
    maxOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: 100,
    status: true,
  });

  /* ── Auto-delete expired coupons from DB ── */
  const deleteExpiredCoupons = async (couponList) => {
    const now = new Date();
    const expired = couponList.filter(c => new Date(c.endDate) < now);

    if (expired.length === 0) return;

    // Delete all expired ones silently in parallel
    const results = await Promise.allSettled(
      expired.map(c =>
        axios.delete(`${API}/coupons/${c._id || c.id}`)
      )
    );

    const deletedCount = results.filter(r => r.status === 'fulfilled').length;

    if (deletedCount > 0) {
      toast.info(
        `🗓️ ${deletedCount} expired coupon${deletedCount > 1 ? 's' : ''} auto-removed`,
        { autoClose: 4000 }
      );
      // Refresh list after cleanup
      fetchCoupons(false); // pass false to skip re-running expiry check
    }
  };

  /* ── Fetch coupons ── */
  const fetchCoupons = async (runExpiryCheck = true) => {
    try {
      const res = await axios.get(`${API}/coupons/all`);
      const data = res.data;
      setCoupons(data);
      if (runExpiryCheck) {
        await deleteExpiredCoupons(data);
      }
    } catch (err) {
      console.error('Error fetching coupons', err);
    }
  };

  /* ── On mount: fetch + start midnight expiry checker ── */
  useEffect(() => {
    fetchCoupons();

    // Schedule a check at midnight every day
    const scheduleNextCheck = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 10, 0); // 00:00:10 next day
      const msUntilMidnight = tomorrow - now;

      expiryCheckRef.current = setTimeout(() => {
        fetchCoupons(); // this will auto-delete expired ones
        scheduleNextCheck(); // reschedule for next midnight
      }, msUntilMidnight);
    };

    scheduleNextCheck();

    return () => {
      if (expiryCheckRef.current) clearTimeout(expiryCheckRef.current);
    };
  }, []);

  /* ── Delete with toast confirmation ── */
  const handleDeleteRequest = (id) => {
    setDeleteTarget(id);
    toast.warn(
      <div style={{ lineHeight: 1.5 }}>
        <strong>Delete this coupon?</strong>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button
            onClick={() => confirmDelete(id)}
            style={{
              background: '#ef4444', color: '#fff', border: 'none',
              borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
            }}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => { toast.dismiss(); setDeleteTarget(null); }}
            style={{
              background: '#e2e8f0', color: '#475569', border: 'none',
              borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
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
        icon: '🗑️',
      }
    );
  };

  const confirmDelete = async (id) => {
    toast.dismiss();
    setDeleteTarget(null);
    try {
      await axios.delete(`${API}/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.maxOrderAmount &&
      parseFloat(formData.maxOrderAmount) > 0 &&
      parseFloat(formData.minOrderAmount) > parseFloat(formData.maxOrderAmount)
    ) {
      toast.error('Max Order Amount must be greater than Min Order Amount!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/coupons/add`, formData);
      toast.success('Coupon Created Successfully!');
      closeAndReset();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    setShowModal(false);
    setFormData({
      code: '', description: '', type: 'percentage',
      discountValue: '', minOrderAmount: 0, maxOrderAmount: '',
      maxDiscount: '', startDate: '', endDate: '',
      usageLimit: 100, status: true,
    });
  };

  /* ── Helpers ── */
  const isExpired = (endDate) => new Date(endDate) < new Date();
  const totalUsage = coupons.reduce((total, c) => total + (c.usedCount || 0), 0);

  return (
    <div className="pp-wrap">

      {/* ── Top Bar ── */}
      <div className="pp-list-topbar">
        <div className="pp-list-title">
          <h2>Manage Coupons</h2>
          <span className="pp-count-pill">{coupons.length} coupons</span>
          <span className="pp-count-pill">{totalUsage} used</span>
        </div>
        <div className="pp-list-actions">
          <button className="pp-btn-add" onClick={() => setShowModal(true)}>
            + Create Coupon
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="pp-table-card">
        <div className="pp-table-scroll">
          <table className="pp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Order Range</th>
                <th>Usage</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="pp-empty">
                      <div className="pp-empty-icon"></div>
                      No coupons found. Create your first one!
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const usedCount    = c.usedCount || 0;
                  const usageLimit   = c.usageLimit || 1;
                  const usagePct     = Math.min(100, Math.round((usedCount / usageLimit) * 100));
                  const limitReached = usedCount >= usageLimit;
                  const expired      = isExpired(c.endDate);

                  const barColor = limitReached
                    ? '#e53935'
                    : usagePct >= 80
                    ? '#ff9800'
                    : '#2e7d32';

                  return (
                    <tr
                      key={c._id || c.id}
                      style={expired ? { opacity: 0.5, background: '#fff5f5' } : {}}
                    >
                      <td>
                        <span className="coupon-code-badge">{c.code}</span>
                        {expired && (
                          <span style={{
                            display: 'block', marginTop: 4,
                            fontSize: 10, fontWeight: 700,
                            color: '#fff', background: '#e53935',
                            borderRadius: 4, padding: '2px 6px',
                            width: 'fit-content'
                          }}>
                            EXPIRED
                          </span>
                        )}
                      </td>

                      <td><span className="pp-type-badge">{c.type}</span></td>

                      <td className="pp-td-sale" style={{ fontWeight: 600 }}>
                        {c.type === 'percentage'
                          ? `${c.discountValue}%`
                          : `₹${c.discountValue}`}
                      </td>

                      <td>
                        <div style={{ fontSize: 13 }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Min: </span>
                          <strong>₹{parseFloat(c.minOrderAmount).toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ fontSize: 13 }}>
                          {c.maxOrderAmount
                            ? <>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Max: </span>
                                <strong>₹{parseFloat(c.maxOrderAmount).toLocaleString('en-IN')}</strong>
                              </>
                            : <span style={{ color: '#2e7d32', fontSize: 12 }}>No upper limit</span>
                          }
                        </div>
                      </td>

                      <td>
                        <div className="usage-bar">
                          <div
                            className="usage-fill"
                            style={{
                              width: `${usagePct}%`,
                              background: barColor,
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                        <div
                          className="usage-txt"
                          style={{ color: limitReached ? '#e53935' : 'inherit', fontWeight: limitReached ? 700 : 400 }}
                        >
                          {usedCount} / {usageLimit}
                          {limitReached && (
                            <span style={{
                              marginLeft: 6, fontSize: 10, fontWeight: 700,
                              color: '#fff', background: '#e53935',
                              borderRadius: 4, padding: '1px 5px'
                            }}>
                              LIMIT REACHED
                            </span>
                          )}
                          {!limitReached && usagePct >= 80 && (
                            <span style={{
                              marginLeft: 6, fontSize: 10, fontWeight: 700,
                              color: '#fff', background: '#ff9800',
                              borderRadius: 4, padding: '1px 5px'
                            }}>
                              ALMOST FULL
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="date-range" style={{ color: expired ? '#e53935' : undefined }}>
                          {new Date(c.startDate).toLocaleDateString()} –{" "}
                          {new Date(c.endDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <span className={`pp-status-badge ${c.status && !expired ? 'in' : 'out'}`}>
                          {expired ? 'Expired' : c.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteRequest(c._id || c.id)}
                          title="Delete Coupon"
                          disabled={deleteTarget === (c._id || c.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {coupons.length > 0 && (
          <div className="pp-pagination">
            <span className="pp-page-info">
              Showing {coupons.length} of {coupons.length} coupons
            </span>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="ars-modal-overlay" onClick={closeAndReset}>
          <div className="ars-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="pp-form-title" style={{ fontSize: 20 }}>Add New Coupon</h3>
              <button className="close-btn" onClick={closeAndReset}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>

              <div className="form-field">
                <label className="form-label">Coupon Code *</label>
                <input
                  name="code" type="text" placeholder="e.g. SAVE50"
                  value={formData.code} onChange={handleChange}
                  className="styled-input" required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <input
                  name="description" type="text"
                  placeholder="e.g. Get 10% off on orders above ₹300"
                  value={formData.description} onChange={handleChange}
                  className="styled-input"
                />
              </div>

              <div className="dual-input-row">
                <div className="form-field">
                  <label className="form-label">Discount Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="styled-input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Discount Value *</label>
                  <input
                    name="discountValue" type="number"
                    placeholder={formData.type === 'percentage' ? 'e.g. 10 (%)' : 'e.g. 50 (₹)'}
                    value={formData.discountValue} onChange={handleChange}
                    className="styled-input" required
                  />
                </div>
              </div>

              <div className="dual-input-row">
                <div className="form-field">
                  <label className="form-label">Min Order Amount (₹) *</label>
                  <input
                    name="minOrderAmount" type="number" placeholder="e.g. 300"
                    value={formData.minOrderAmount} onChange={handleChange}
                    className="styled-input" min="0" required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Max Order Amount (₹)
                    <span style={{ color: '#999', fontSize: 11, marginLeft: 4 }}>optional</span>
                  </label>
                  <input
                    name="maxOrderAmount" type="number"
                    placeholder="e.g. 500 (empty = no limit)"
                    value={formData.maxOrderAmount} onChange={handleChange}
                    className="styled-input" min="0"
                  />
                </div>
              </div>

              {formData.type === 'percentage' && (
                <div className="form-field">
                  <label className="form-label">
                    Max Discount Cap (₹)
                    <span style={{ color: '#999', fontSize: 11, marginLeft: 4 }}>optional</span>
                  </label>
                  <input
                    name="maxDiscount" type="number"
                    placeholder="e.g. 200 (max ₹200 discount even if % is higher)"
                    value={formData.maxDiscount} onChange={handleChange}
                    className="styled-input" min="0"
                  />
                </div>
              )}

              <div className="dual-input-row">
                <div className="form-field">
                  <label className="form-label">Start Date *</label>
                  <input
                    name="startDate" type="date"
                    value={formData.startDate} onChange={handleChange}
                    className="styled-input" required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">End Date *</label>
                  <input
                    name="endDate" type="date"
                    value={formData.endDate} onChange={handleChange}
                    className="styled-input" required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Usage Limit</label>
                <input
                  name="usageLimit" type="number" placeholder="e.g. 100"
                  value={formData.usageLimit} onChange={handleChange}
                  className="styled-input" min="1"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="pp-btn-cancel" onClick={closeAndReset}>Cancel</button>
                <button type="submit" className="pp-btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;