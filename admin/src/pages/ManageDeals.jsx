import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RiTimerFlashFill, RiDeleteBin6Line, RiSave3Fill, RiImageAddLine, RiEditLine, RiCloseLine } from "react-icons/ri";
import './ManageDeals.css';

import { API, IMG } from '../config';
const DEALS_API = `${API}/deals`;


const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="dd-confirm-overlay">
    <div className="dd-confirm-box">
      <div className="dd-confirm-icon">🗑</div>
      <p className="dd-confirm-msg">{message}</p>
      <div className="dd-confirm-actions">
        <button className="dd-confirm-cancel" onClick={onCancel}>Cancel</button>
        <button className="dd-confirm-ok" onClick={onConfirm}>Remove</button>
      </div>
    </div>
  </div>
);

const ManageDeals = () => {
  const [deals, setDeals]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [file, setFile]                 = useState(null);
  const [editingId, setEditingId]       = useState(null);

  // ── Confirm dialog state ──
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmMsg, setConfirmMsg]       = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    expiryDate:  '',
    buttonText:  'SHOP NOW',
    buttonLink:  '/shop'
  });

  const fetchDeals = useCallback(async () => {
    setFetchLoading(true);
    try {
      const res = await axios.get(`${DEALS_API}/active`);
      setDeals(res.data ? [res.data] : []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (deal) => {
    setEditingId(deal.id || deal._id);
    setFormData({
      title:       deal.title,
      description: deal.description,
      expiryDate:  new Date(deal.expiryDate).toISOString().slice(0, 16),
      buttonText:  deal.buttonText,
      buttonLink:  deal.buttonLink
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', expiryDate: '', buttonText: 'SHOP NOW', buttonLink: '/shop' });
    setFile(null);
  };

  // ── Helper: show custom confirm ──
  const showConfirm = (message, action) => {
    setConfirmMsg(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };
  const handleConfirmYes = () => {
    setConfirmOpen(false);
    confirmAction && confirmAction();
  };
  const handleConfirmNo = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editingId && deals.length === 0) return toast.error("Please select an image.");

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('image', file);

    try {
      if (editingId) {
        await axios.put(`${DEALS_API}/update/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Deal updated successfully! ");
      } else {
        await axios.post(`${DEALS_API}/add`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("New deal activated! ");
      }
      cancelEdit();
      fetchDeals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm(
      "Remove this deal from the live site?",
      async () => {
        try {
          await axios.delete(`${DEALS_API}/${id}`);
          toast.success("Deal removed successfully! ");
          fetchDeals();
        } catch (err) {
          toast.error("Delete failed: " + (err.response?.data?.message || err.message));
        }
      }
    );
  };

  return (
    <div className="dd-wrap">

      {/* Confirm dialog — rendered at root so it overlays everything */}
      {confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}

      <div className="dd-header">
        <h2><RiTimerFlashFill /> Deal of the Day Settings</h2>
      </div>

      <div className="dd-form-grid">
        {/* ── LEFT: Form ── */}
        <div className="dd-section-card">
          <div className="dd-card-header">
            <span className="dd-section-label">
              {editingId ? "Update Live Deal" : "Configure New Deal"}
            </span>
            {editingId && (
              <button className="dd-cancel-btn" onClick={cancelEdit}>
                <RiCloseLine /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dd-input-group">
              <label>Deal Title</label>
              <input className="dd-input" type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>

            <div className="dd-input-group">
              <label>Expiry Date &amp; Time</label>
              <input className="dd-input" type="datetime-local" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required />
            </div>

            <div className="dd-input-group">
              <label>Description</label>
              <textarea className="dd-textarea" name="description" value={formData.description} onChange={handleInputChange} required />
            </div>

            {/* ── Button Text + Button Link ── */}
            <div className="dd-input-row">
              <div className="dd-input-group">
                <label>Button Text</label>
                <input className="dd-input" type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} />
              </div>
              <div className="dd-input-group">
                <label>Button Link</label>
                <input className="dd-input" type="text" name="buttonLink" value={formData.buttonLink} onChange={handleInputChange} />
              </div>
            </div>

            {/* ── Banner Image ── */}
            <div className="dd-input-group">
              <label>Banner {editingId && "(Optional)"}</label>
              <div className="dd-file-input-wrapper">
                <input type="file" id="file-upload" accept="image/*" onChange={(e) => setFile(e.target.files[0])} hidden />
                <label htmlFor="file-upload" className="dd-file-label">
                  <RiImageAddLine /> {file ? file.name : editingId ? "Change Image" : "Choose Image"}
                </label>
              </div>
            </div>

            <button type="submit" className={`dd-btn-save ${editingId ? 'update-mode' : ''}`} disabled={loading}>
              <RiSave3Fill /> {loading ? "Saving..." : editingId ? "Update Live Deal" : "Activate Deal"}
            </button>
          </form>
        </div>

        {/* ── RIGHT: Live Deal Table ── */}
        <div className="dd-section-card">
          <span className="dd-section-label">Currently Live Deal</span>
          <div className="dd-table-wrapper">
            <table className="dd-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Ends At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetchLoading ? (
                  <tr><td colSpan="4" className="dd-status-text">Loading...</td></tr>
                ) : deals.length > 0 ? deals.map(d => (
                  <tr key={d.id || d._id}>
                    <td>
                      <img src={`${IMG}${d.image}`} alt="deal" className="dd-mini-img" />
                    </td>
                    <td>
                      <span className="dd-preview-title">{d.title}</span>
                      <span className="dd-status-live">Live</span>
                    </td>
                    <td className="dd-preview-time">
                      {new Date(d.expiryDate).toLocaleString()}
                    </td>
                    <td className="dd-actions-cell">
                      <button onClick={() => handleEdit(d)} className="dd-edit-btn" title="Edit">
                        <RiEditLine />
                      </button>
                      <button onClick={() => handleDelete(d.id || d._id)} className="dd-del-btn" title="Delete">
                        <RiDeleteBin6Line />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="dd-status-text">No active deal.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDeals;