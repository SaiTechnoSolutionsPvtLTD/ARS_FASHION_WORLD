import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Category.css';

import { API, IMG } from '../config';
const PER_PAGE = 10;

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [panel, setPanel]           = useState('list');
  const [editId, setEditId]         = useState(null);
  const [viewData, setViewData]     = useState(null);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  const [name, setName]                 = useState('');
  const [image, setImage]               = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(null);

  // ── confirm-delete modal state ──
  const [confirmId, setConfirmId]     = useState(null);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories/all`);
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditId(null); setName('');
    setImage(null); setImagePreview(null);
    setPanel('list');
  };

  const openAdd  = () => { resetForm(); setPanel('form'); };

  const openEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name || '');
    setImagePreview(cat.image ? IMG + cat.image : null);
    setImage(null);
    setPanel('form');
  };

  const openView = (cat) => { setViewData(cat); setPanel('view'); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (image) fd.append('image', image);

      if (editId) {
        await axios.put(`${API}/categories/update/${editId}`, fd);
        toast.success(` "${name}" updated successfully!`);
      } else {
        await axios.post(`${API}/categories/add`, fd);
        toast.success(` "${name}" added successfully!`);
      }
      await fetchCategories();
      resetForm();
      setPage(1);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error saving. Check backend connection.';
      toast.error(` ${msg}`);
    }
    setSaving(false);
  };

  // step 1: open inline confirm instead of browser alert
  const handleDeleteClick = (cat) => {
    setConfirmId(cat.id);
    setConfirmName(cat.name);
  };

  // step 2: user confirmed → delete
  const handleDeleteConfirm = async () => {
    const id   = confirmId;
    const cname = confirmName;
    setConfirmId(null);
    setConfirmName('');
    setDeleting(id);
    try {
      await axios.delete(`${API}/categories/delete/${id}`);
      await fetchCategories();
      toast.success(` "${cname}" deleted successfully!`);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Delete failed. Try again.';
      toast.error(` ${msg}`);
    }
    setDeleting(null);
  };

  const handleDeleteCancel = () => {
    setConfirmId(null);
    setConfirmName('');
    toast.info('Delete cancelled.');
  };

  const filtered   = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const safePage   = page > totalPages ? 1 : page;
  const current    = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
      acc.push(n);
      return acc;
    }, []);

  // ── FORM ──
  if (panel === 'form') return (
    <div className="cp-wrap">
      <div className="cp-form-topbar">
        <button className="cp-back-btn" onClick={resetForm}>← Back</button>
        <h2 className="cp-form-title">{editId ? 'Edit Category' : 'New Category'}</h2>
      </div>

      <div className="cp-form-card">
        <form onSubmit={handleSubmit}>
          <div className="cp-section-label">Category Info</div>

          <div className="cp-form-group">
            <label className="cp-field-label">Category Name *</label>
            <input
              className="cp-input"
              placeholder="e.g. Sarees, Kurtas..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="cp-form-group">
            <label className="cp-field-label">Category Image</label>
            <div className="cp-upload-area" onClick={() => document.getElementById('catImgInput').click()}>
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="cp-upload-preview" />
                : (
                  <div className="cp-upload-placeholder">
                    <span className="cp-upload-icon">⬆</span>
                    <span>Click to upload image</span>
                  </div>
                )
              }
            </div>
            <input id="catImgInput" type="file" accept="image/*" hidden onChange={handleImageChange} />
            {imagePreview && (
              <button type="button" className="cp-remove-img" onClick={() => { setImage(null); setImagePreview(null); }}>
                ✕ Remove image
              </button>
            )}
          </div>

          <div className="cp-form-actions">
            <button type="button" className="cp-btn-cancel" onClick={resetForm}>Discard</button>
            <button type="submit" className="cp-btn-save" disabled={saving}>
              {saving ? 'Saving...' : (editId ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── VIEW ──
  if (panel === 'view' && viewData) return (
    <div className="cp-wrap">
      <div className="cp-form-topbar">
        <button className="cp-back-btn" onClick={() => { setViewData(null); setPanel('list'); }}>← Back</button>
        <h2 className="cp-form-title">Category Detail</h2>
        <button className="cp-btn-edit-top" onClick={() => openEdit(viewData)}>✏ Edit</button>
      </div>

      <div className="cp-view-card">
        <div className="cp-view-img-wrap">
          {viewData.image
            ? <img src={IMG + viewData.image} className="cp-view-img" alt={viewData.name} onError={e => e.target.style.display='none'} />
            : <div className="cp-view-no-img">No Image</div>
          }
        </div>
        <div className="cp-view-info">
          <div className="cp-view-badge">Category</div>
          <h2 className="cp-view-name">{viewData.name}</h2>
          <div className="cp-view-meta">
            <div className="cp-view-meta-item">
              <span>Category ID</span>
              <strong>#{viewData.id}</strong>
            </div>
            <div className="cp-view-meta-item">
              <span>Products</span>
              <strong>{viewData.productCount ?? viewData.Products?.length ?? '—'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TABLE LIST ──
  return (
    <div className="cp-wrap">

      {/* ── Inline Delete Confirm Modal ── */}
      {confirmId && (
        <div className="cp-modal-overlay">
          <div className="cp-modal">
            <div className="cp-modal-icon">🗑️</div>
            <h3 className="cp-modal-title">Delete Category?</h3>
            <p className="cp-modal-msg">
              You're about to delete <strong>"{confirmName}"</strong>.<br />
              This will also remove all its associated products. This action cannot be undone.
            </p>
            <div className="cp-modal-actions">
              <button className="cp-modal-cancel" onClick={handleDeleteCancel}>Cancel</button>
              <button className="cp-modal-confirm" onClick={handleDeleteConfirm}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="cp-list-topbar">
        <div className="cp-list-title">
          <h2>Categories</h2>
          <span className="cp-count-pill">{filtered.length} total</span>
        </div>
        <div className="cp-list-actions">
          <div className="cp-search-box">
            <span className="cp-search-icon">⌕</span>
            <input
              placeholder="Search categories..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="cp-btn-add" onClick={openAdd}>+ New Category</button>
        </div>
      </div>

      <div className="cp-table-card">
        <div className="cp-table-scroll">
          <table className="cp-table">
            <colgroup>
              <col style={{ width: '6%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '52%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>#</th>
                <th>Image</th>
                <th>Category Name</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.length > 0 ? current.map((cat, idx) => (
                <tr key={cat.id}>
                  <td className="cp-td-num">{(safePage - 1) * PER_PAGE + idx + 1}</td>
                  <td className="cp-td-img">
                    {cat.image
                      ? <img src={IMG + cat.image} className="cp-tbl-img" alt={cat.name} onError={e => e.target.style.display='none'} />
                      : <div className="cp-tbl-no-img">—</div>
                    }
                  </td>
                  <td className="cp-td-name">
                    <span className="cp-name-main">{cat.name}</span>
                  </td>
                  <td>
                    <span className="cp-prod-count">
                      {cat.productCount ?? cat.Products?.length ?? 0} items
                    </span>
                  </td>
                  <td>
                    <div className="cp-action-btns">
                      <button className="cp-act-btn view" onClick={() => openView(cat)} title="View">👁</button>
                      <button className="cp-act-btn edit" onClick={() => openEdit(cat)} title="Edit">✏</button>
                      <button
                        className="cp-act-btn del"
                        onClick={() => handleDeleteClick(cat)}
                        title="Delete"
                        disabled={deleting === cat.id}
                      >
                        {deleting === cat.id ? '⏳' : '🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">
                    <div className="cp-empty">
                      <div className="cp-empty-icon">⊞</div>
                      <div>{search ? 'No categories match your search.' : 'No categories yet. Add your first one!'}</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="cp-pagination">
            <span className="cp-page-info">
              Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} categories
            </span>
            <div className="cp-page-btns">
              <button disabled={safePage === 1} onClick={() => setPage(1)} title="First">«</button>
              <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)} title="Previous">‹</button>
              {pageNumbers.map((n, i) =>
                n === '...'
                  ? <span key={`d${i}`} className="cp-dots">…</span>
                  : <button key={n} className={safePage === n ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
              )}
              <button disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)} title="Next">›</button>
              <button disabled={safePage === totalPages} onClick={() => setPage(totalPages)} title="Last">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;