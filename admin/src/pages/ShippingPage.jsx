// FILE PATH: ars-admin/src/pages/ShippingPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ShippingPage.css';
import { API } from '../config';

// State names sourced from:
// github.com/sab99r/Indian-States-And-Districts (inlined to avoid CORS)
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar',
  'Chandigarh (UT)','Chhattisgarh','Dadra and Nagar Haveli (UT)',
  'Daman and Diu (UT)','Delhi (NCT)','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka',
  'Kerala','Lakshadweep (UT)','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Puducherry (UT)','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttarakhand','Uttar Pradesh','West Bengal',
];

const ShippingPage = () => {
  const [rates,      setRates]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);

  const [formState,  setFormState]  = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [editId,     setEditId]     = useState(null);

  const token   = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/shipping`, { headers });
      setRates(res.data);
    } catch {
      toast.error('Failed to load shipping rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const configuredStates = rates.map(r => r.state);
  const availableStates  = INDIAN_STATES.filter(
    s => !configuredStates.includes(s) || s === formState
  );
  const unsetCount = INDIAN_STATES.filter(s => !configuredStates.includes(s)).length;

  const handleEdit = (rate) => {
    setEditId(rate.id);
    setFormState(rate.state);
    setFormAmount(String(parseFloat(rate.amount)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditId(null);
    setFormState('');
    setFormAmount('');
  };

  const handleSave = async () => {
    if (!formState)
      return toast.error('Please select a state');
    if (formAmount === '' || isNaN(formAmount) || parseFloat(formAmount) < 0)
      return toast.error('Enter a valid shipping amount (0 or more)');

    setSaving(true);
    try {
      await axios.post(
        `${API}/shipping`,
        { state: formState, amount: parseFloat(formAmount) },
        { headers }
      );
      toast.success(`Rate ${editId ? 'updated' : 'added'} for ${formState}`);
      handleCancel();
      fetchRates();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/shipping/${id}`, { headers });
      toast.success('Rate deleted');
      setDeleteId(null);
      fetchRates();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="sp-page">

      {/* ── Page Header ── */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">Shipping Rates</h1>
          <p className="sp-page-desc">Flat-rate shipping costs by state. Unconfigured regions default to free shipping.</p>
        </div>
        <div className="sp-stats-row">
          <div className="sp-stat">
            <span className="sp-stat-value">{rates.length}</span>
            <span className="sp-stat-label">Configured</span>
          </div>
          <div className="sp-stat-divider" />
          <div className="sp-stat">
            <span className="sp-stat-value">{unsetCount}</span>
            <span className="sp-stat-label">Default free</span>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Form ── */}
      <div className="sp-form-card">
        <p className="sp-form-label">
          {editId ? `Editing rate for ${formState}` : 'Add new rate'}
        </p>
        <div className="sp-form-row">
          <div className="sp-field">
            <label className="sp-field-label">State / Region</label>
            <select
              value={formState}
              onChange={e => setFormState(e.target.value)}
              disabled={!!editId}
              className="sp-select"
            >
              <option value="">Select state…</option>
              {(editId ? INDIAN_STATES : availableStates).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="sp-field sp-field--sm">
            <label className="sp-field-label">Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0 = free"
              value={formAmount}
              onChange={e => setFormAmount(e.target.value)}
              className="sp-input"
            />
          </div>

          <div className="sp-form-actions">
            {editId && (
              <button className="sp-btn sp-btn--ghost" onClick={handleCancel}>
                Cancel
              </button>
            )}
            <button
              className="sp-btn sp-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : editId ? 'Update rate' : 'Add rate'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Rates Table ── */}
      <div className="sp-table-wrap">
        {loading ? (
          <div className="sp-state-box">
            <span className="sp-spinner" />
            <span>Loading rates…</span>
          </div>
        ) : rates.length === 0 ? (
          <div className="sp-state-box">
            <span className="sp-empty-icon">📦</span>
            <p>No rates configured yet. Add one above.</p>
          </div>
        ) : (
          <table className="sp-table">
            <thead>
              <tr>
                <th className="sp-th sp-th--idx">#</th>
                <th className="sp-th">State / Region</th>
                <th className="sp-th">Shipping Fee</th>
                <th className="sp-th sp-th--right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, i) => (
                <tr key={rate.id} className="sp-tr">
                  <td className="sp-td sp-td--idx">{i + 1}</td>
                  <td className="sp-td sp-td--name">{rate.state}</td>
                  <td className="sp-td">
                    {parseFloat(rate.amount) === 0 ? (
                      <span className="sp-badge sp-badge--free">Free</span>
                    ) : (
                      <span className="sp-amount">
                        ₹{parseFloat(rate.amount).toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td className="sp-td sp-td--actions">
                    {deleteId === rate.id ? (
                      <div className="sp-confirm-row">
                        <span className="sp-confirm-text">Delete this rate?</span>
                        <button className="sp-btn sp-btn--danger" onClick={() => handleDelete(rate.id)}>
                          Delete
                        </button>
                        <button className="sp-btn sp-btn--ghost" onClick={() => setDeleteId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="sp-action-row">
                        <button className="sp-btn sp-btn--ghost" onClick={() => handleEdit(rate)}>
                          Edit
                        </button>
                        <button className="sp-btn sp-btn--ghost sp-btn--del-trigger" onClick={() => setDeleteId(rate.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ShippingPage;