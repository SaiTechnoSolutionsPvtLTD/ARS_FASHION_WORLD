import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API, IMG } from '../config';

/* ── Custom Confirm Dialog ── */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="pp-confirm-overlay">
    <div className="pp-confirm-box">
      <div className="pp-confirm-icon"></div>
      <p className="pp-confirm-msg">{message}</p>
      <div className="pp-confirm-actions">
        <button className="pp-confirm-cancel" onClick={onCancel}>Cancel</button>
        <button className="pp-confirm-ok" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const OfferBannerPage = () => {
  const [offers, setOffers]           = useState([]);
  const [panel, setPanel]             = useState('list');
  const [editId, setEditId]           = useState(null);
  const [title, setTitle]             = useState('');
  const [subtitle, setSubtitle]       = useState('');
  const [buttonText, setButtonText]   = useState('Shop Now');
  const [link, setLink]               = useState('');

  const [imgFile, setImgFile]         = useState(null);
  const [imgPrev, setImgPrev]         = useState(null);
  const [saving, setSaving]           = useState(false);

  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmMsg, setConfirmMsg]       = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const r = await axios.get(`${API}/offer-banners/admin/all`);
      setOffers(r.data);
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setEditId(null); setTitle(''); setSubtitle('');
    setButtonText('Shop Now'); setLink('');
    setImgFile(null); setImgPrev(null); setPanel('list');
  };

  const openEdit = (o) => {
    setEditId(o.id); setTitle(o.title || ''); setSubtitle(o.subtitle || '');
    setButtonText(o.buttonText || 'Shop Now'); setLink(o.link || '');
    setImgPrev(IMG + o.image);
    setImgFile(null); setPanel('form');
  };

  const handleImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setImgFile(f); setImgPrev(URL.createObjectURL(f));
  };

  const showConfirm = (message, action) => {
    setConfirmMsg(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };
  const handleConfirmYes = () => { setConfirmOpen(false); confirmAction?.(); };
  const handleConfirmNo  = () => { setConfirmOpen(false); setConfirmAction(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('subtitle', subtitle);
      fd.append('buttonText', buttonText);
      fd.append('link', link);
      fd.append('status', true);
      if (imgFile) fd.append('image', imgFile);

      if (editId) {
        await axios.put(`${API}/offer-banners/update/${editId}`, fd);
        toast.success('Offer banner updated successfully! ');
      } else {
        await axios.post(`${API}/offer-banners/add`, fd);
        toast.success('Offer banner added successfully! ');
      }
      await fetchOffers();
      resetForm();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error processing request');
    }
    setSaving(false);
  };

  const deleteOffer = (id, offerTitle) => {
    showConfirm(
      `Delete "${offerTitle || 'this offer banner'}"? This cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${API}/offer-banners/delete/${id}`);
          toast.success('Offer banner deleted successfully! ');
          fetchOffers();
        } catch (e) {
          toast.error('Delete failed: ' + (e.response?.data?.message || e.message));
        }
      }
    );
  };

  if (panel === 'form') return (
    <div className="pp-wrap">
      {confirmOpen && <ConfirmDialog message={confirmMsg} onConfirm={handleConfirmYes} onCancel={handleConfirmNo} />}
      <div className="pp-form-topbar">
        <button className="pp-back-btn" onClick={resetForm}>← Back</button>
        <h2 className="pp-form-title">{editId ? 'Edit Offer Banner' : 'New Offer Banner'}</h2>
      </div>
      <div style={{maxWidth:'580px'}}>
        <form onSubmit={handleSubmit}>
          <div className="pp-section-card">
            <div className="pp-section-label">Offer Banner Details</div>
            <label className="pp-price-label">Title *</label>
            <input className="pp-input" placeholder="e.g. Mega Sale" value={title}
              onChange={e => setTitle(e.target.value)} required />
            <label className="pp-price-label">Subtitle</label>
            <input className="pp-input" placeholder="e.g. Upto 70% off" value={subtitle}
              onChange={e => setSubtitle(e.target.value)} />
            <label className="pp-price-label">Button Text</label>
            <input className="pp-input" placeholder="Shop Now" value={buttonText}
              onChange={e => setButtonText(e.target.value)} />
            <label className="pp-price-label">Link URL</label>
            <input className="pp-input" placeholder="/shop" value={link}
              onChange={e => setLink(e.target.value)} />
            <label className="pp-price-label">Image {!editId && '*'}</label>
            <div className="pp-main-upload-area" style={{aspectRatio:'16/7'}}
              onClick={() => document.getElementById('offerImg').click()}>
              {imgPrev
                ? <img src={imgPrev} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                : <div className="pp-upload-placeholder"><span>⬆ Click to upload</span></div>
              }
            </div>
            <input id="offerImg" type="file" accept="image/*" hidden onChange={handleImg} />
          </div>
          <div className="pp-form-actions">
            <button type="button" className="pp-btn-cancel" onClick={resetForm}>Cancel</button>
            <button type="submit" className="pp-btn-save" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Banner' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="pp-wrap">
      {confirmOpen && <ConfirmDialog message={confirmMsg} onConfirm={handleConfirmYes} onCancel={handleConfirmNo} />}
      <div className="pp-list-topbar">
        <div className="pp-list-title">
          <h2>Offer Banners</h2>
          <span className="pp-count-pill">{offers.length} total</span>
        </div>
        <button className="pp-btn-add" onClick={() => setPanel('form')}>+ Add Offer Banner</button>
      </div>
      <div className="pp-table-card">
        <div className="pp-table-scroll">
          <table className="pp-table">
            <thead>
              <tr><th>#</th><th>Image</th><th>Title</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.length > 0 ? offers.map((o, i) => (
                <tr key={o.id}>
                  <td>{i+1}</td>
                  <td>
                    <img src={IMG + o.image} alt="img"
                      style={{width:'80px',height:'50px',objectFit:'cover',borderRadius:'4px',display:'block'}} />
                  </td>
                  <td>{o.title}</td>
                  <td>
                    <div className="pp-action-btns">
                      <button className="pp-act-btn edit" onClick={() => openEdit(o)}>✏</button>
                      <button className="pp-act-btn del" onClick={() => deleteOffer(o.id, o.title)}>🗑</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4">
                  <div className="pp-empty"><div className="pp-empty-icon">🏷</div><div>No offer banners yet.</div></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfferBannerPage;
