import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API, IMG } from '../config';

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

const BannerPage = () => {
  const [banners, setBanners]       = useState([]);
  const [panel, setPanel]           = useState('list');
  const [editId, setEditId]         = useState(null);
  const [title, setTitle]           = useState('');
  const [subtitle, setSubtitle]     = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [link, setLink]             = useState('');
  const [imgFile, setImgFile]       = useState(null);
  const [imgPrev, setImgPrev]       = useState(null);
  const [saving, setSaving]         = useState(false);

  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmMsg, setConfirmMsg]       = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try { const r = await axios.get(`${API}/banners/all`); setBanners(r.data); }
    catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setEditId(null); setTitle(''); setSubtitle('');
    setButtonText('Shop Now'); setLink('');
    setImgFile(null); setImgPrev(null); setPanel('list');
  };

  const openEdit = (b) => {
    setEditId(b.id); setTitle(b.title || ''); setSubtitle(b.subtitle || '');
    setButtonText(b.buttonText || 'Shop Now'); setLink(b.link || '');
    setImgPrev(IMG + b.image); setImgFile(null); setPanel('form');
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
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('subtitle', subtitle);
      fd.append('buttonText', buttonText); fd.append('link', link);
      if (imgFile) fd.append('image', imgFile);

      if (editId) {
        await axios.put(`${API}/banners/update/${editId}`, fd);
        toast.success('Banner updated successfully! ');
      } else {
        await axios.post(`${API}/banners/add`, fd);
        toast.success('Banner added successfully! ');
      }
      await fetchBanners(); resetForm();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Something went wrong');
    }
    setSaving(false);
  };

  const deleteBanner = (id, bannerTitle) => {
    showConfirm(
      `Delete "${bannerTitle || 'this banner'}"? This cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${API}/banners/delete/${id}`);
          toast.success('Banner deleted successfully! ');
          fetchBanners();
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
        <h2 className="pp-form-title">{editId ? 'Edit Banner' : 'New Banner'}</h2>
      </div>
      <div style={{maxWidth:'580px'}}>
        <form onSubmit={handleSubmit}>
          <div className="pp-section-card">
            <div className="pp-section-label">Banner Details</div>
            <label className="pp-price-label">Banner Title *</label>
            <input className="pp-input" placeholder="e.g. Summer Collection 2026" value={title}
              onChange={e => setTitle(e.target.value)} required />
            <label className="pp-price-label">Subtitle / Description</label>
            <input className="pp-input" placeholder="e.g. Upto 50% off on all items" value={subtitle}
              onChange={e => setSubtitle(e.target.value)} />
            <label className="pp-price-label">Button Text</label>
            <input className="pp-input" placeholder="Shop Now" value={buttonText}
              onChange={e => setButtonText(e.target.value)} />
            <label className="pp-price-label">Link URL (optional)</label>
            <input className="pp-input" placeholder="https://... or /shop" value={link}
              onChange={e => setLink(e.target.value)} />
            <label className="pp-price-label">Banner Image {!editId && '*'}</label>
            <div className="pp-main-upload-area" style={{aspectRatio:'21/9'}}
              onClick={() => document.getElementById('bannerImg').click()}>
              {imgPrev
                ? <img src={imgPrev} alt="banner" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                : <div className="pp-upload-placeholder"><span style={{fontSize:'28px'}}>⬆</span><span>Click to upload banner image</span></div>
              }
            </div>
            <input id="bannerImg" type="file" accept="image/*" hidden onChange={handleImg} />
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
          <h2>Banners</h2>
          <span className="pp-count-pill">{banners.length} total</span>
        </div>
        <button className="pp-btn-add" onClick={() => setPanel('form')}>+ Add Banner</button>
      </div>
      <div className="pp-table-card">
        <div className="pp-table-scroll">
          <table className="pp-table">
            <thead>
              <tr><th>#</th><th>Preview</th><th>Title</th><th>Subtitle</th><th>Button</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {banners.length > 0 ? banners.map((b, i) => (
                <tr key={b.id}>
                  <td className="pp-td-num">{i+1}</td>
                  <td style={{width:'120px'}}>
                    <img src={IMG + b.image} alt={b.title}
                      style={{width:'110px',height:'55px',objectFit:'cover',borderRadius:'6px',border:'1px solid #222'}} />
                  </td>
                  <td><span style={{color:'#00044a',fontWeight:500}}>{b.title || '—'}</span></td>
                  <td style={{color:'#00044a',fontSize:'12px',maxWidth:'180px'}}>{b.subtitle || '—'}</td>
                  <td><span className="pp-cat-badge">{b.buttonText || 'Shop Now'}</span></td>
                  <td>
                    <div className="pp-action-btns">
                      <button className="pp-act-btn edit" onClick={() => openEdit(b)} title="Edit">✏</button>
                      <button className="pp-act-btn del" onClick={() => deleteBanner(b.id, b.title)} title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6"><div className="pp-empty"><div className="pp-empty-icon">🖼</div><div>No banners yet. Add your first one!</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BannerPage;
