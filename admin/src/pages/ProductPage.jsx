import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProductPage.css';

import { API, IMG } from '../config';
const SIZES = ['All Sizes', 'Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PER_PAGE = 10;

const emptyVariant = () => ({ size: 'S', color: '', mrpPrice: '', salesPrice: '', quantity: '' });

/* ─────────────────────────────────────────
   Custom Confirm Dialog (replaces window.confirm)
───────────────────────────────────────── */
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

const ProductPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stockFilter = searchParams.get('filter') || 'all';

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [panel, setPanel]           = useState('list');
  const [editId, setEditId]         = useState(null);
  const [viewProd, setViewProd]     = useState(null);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  // ── Confirm dialog state ──
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [confirmMsg, setConfirmMsg]     = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Form
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [catId, setCatId]       = useState('');
  const [mrp, setMrp]           = useState('');
  const [sales, setSales]       = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [mainPrev, setMainPrev] = useState(null);

  // Thumbnails
  const [existingThumbs, setExistingThumbs]   = useState([]);
  const [newThumbFiles, setNewThumbFiles]     = useState([]);
  const [newThumbPrevs, setNewThumbPrevs]     = useState([]);
  const [removedThumbIds, setRemovedThumbIds] = useState([]);

  // Collection checkboxes
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTrending, setIsTrending]     = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const [variants, setVariants] = useState([emptyVariant()]);
  const [saving, setSaving]     = useState(false);
  const thumbInput = useRef();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get(`${API}/products/all`),
        axios.get(`${API}/categories/all`)
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setEditId(null); setName(''); setDesc(''); setCatId('');
    setMrp(''); setSales('');
    setMainFile(null); setMainPrev(null);
    setExistingThumbs([]); setNewThumbFiles([]); setNewThumbPrevs([]);
    setRemovedThumbIds([]);
    setIsBestSeller(false); setIsTrending(false); setIsNewArrival(false);
    setVariants([emptyVariant()]);
    setPanel('list');
  };

  useEffect(() => {
    setPage(1);
  }, [location.search]);

  const getProductStock = (p) => {
    if (typeof p.totalStock === 'number') return p.totalStock;
    if (Array.isArray(p.variants)) {
      return p.variants.reduce((sum, v) => sum + Number(v.quantity || 0), 0);
    }
    return 0;
  };

  // ── Helper: show custom confirm dialog ──
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

  const openAdd  = () => { resetForm(); setPanel('form'); };
  const openEdit = (p) => {
    setEditId(p.id); setName(p.name || ''); setDesc(p.description || '');
    setCatId(p.categoryId || ''); setMrp(p.mrpPrice || ''); setSales(p.salesPrice || '');
    setMainPrev(p.mainImage ? IMG + p.mainImage : null); setMainFile(null);
    setExistingThumbs(p.thumbnails || []);
    setNewThumbFiles([]); setNewThumbPrevs([]); setRemovedThumbIds([]);
    setIsBestSeller(!!p.isBestSeller);
    setIsTrending(!!p.isTrending);
    setIsNewArrival(!!p.isNewArrival);
    setVariants(p.variants?.length ? p.variants : [emptyVariant()]);
    setPanel('form');
  };
  const openView = (p) => { setViewProd(p); setPanel('view'); };

  const handleMainImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setMainFile(f); setMainPrev(URL.createObjectURL(f));
  };

  const activeExisting  = existingThumbs.filter(t => !removedThumbIds.includes(t.id));
  const totalThumbCount = activeExisting.length + newThumbPrevs.length;

  const handleThumbs = (e) => {
    const files     = Array.from(e.target.files);
    const remaining = 7 - totalThumbCount;
    if (remaining <= 0) { toast.error('Maximum 7 images allowed!'); return; }
    const toAdd = files.slice(0, remaining);
    setNewThumbFiles(prev => [...prev, ...toAdd]);
    setNewThumbPrevs(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    thumbInput.current.value = '';
  };

  const removeExistingThumb = (id) => setRemovedThumbIds(prev => [...prev, id]);
  const removeNewThumb = (idx) => {
    setNewThumbFiles(prev => prev.filter((_, i) => i !== idx));
    setNewThumbPrevs(prev => prev.filter((_, i) => i !== idx));
  };

  const setVariantField = (i, key, val) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v));

  // ── SUBMIT ──
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);         fd.append('description', desc);
      fd.append('categoryId', catId);  fd.append('mrpPrice', mrp);
      fd.append('salesPrice', sales);
      if (mainFile) fd.append('mainImage', mainFile);
      newThumbFiles.forEach(f => fd.append('thumbnails', f));
      fd.append('removedThumbIds', JSON.stringify(removedThumbIds));
      fd.append('variants', JSON.stringify(variants));
      fd.append('isBestSeller', isBestSeller);
      fd.append('isTrending', isTrending);
      fd.append('isNewArrival', isNewArrival);

      if (editId) {
        await axios.put(`${API}/products/update/${editId}`, fd);
        toast.success('Product updated successfully! ');   // ✅ update toast
      } else {
        await axios.post(`${API}/products/add`, fd);
        toast.success('Product published successfully! '); // ✅ add toast
      }

      await fetchAll(); resetForm(); setPage(1);
    } catch (e) {
      toast.error('Error: ' + (e.response?.data?.error || e.message));
    }
    setSaving(false);
  };

  // ── DELETE — uses custom confirm dialog instead of window.confirm ──
  const handleDelete = (id, productName) => {
    showConfirm(
      `Delete "${productName || 'this product'}"? This cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${API}/products/delete/${id}`);
          toast.success('Product deleted successfully! ');  // ✅ delete toast
          fetchAll();
        } catch (e) {
          toast.error('Delete failed: ' + (e.response?.data?.error || e.message));
        }
      }
    );
  };

  const filteredBySearch = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = filteredBySearch.filter((p) => {
    const stock = getProductStock(p);
    if (stockFilter === 'outofstock') return stock === 0;
    if (stockFilter === 'lowstock') return stock > 0 && stock < 10;
    if (stockFilter === 'instock') return stock >= 10;
    return true;
  });

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

  // ══════════════════════════════════
  // FORM
  // ══════════════════════════════════
  if (panel === 'form') return (
    <div className="pp-wrap">
      {confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}

      <div className="pp-form-topbar">
        <button className="pp-back-btn" onClick={resetForm}>← Back</button>
        <h2 className="pp-form-title">{editId ? 'Edit Product' : 'New Product'}</h2>
      </div>

      <form className="pp-form-grid" onSubmit={handleSubmit}>
        {/* LEFT */}
        <div className="pp-form-left">
          <div className="pp-section-card">
            <div className="pp-section-label">Basic Info</div>
            <input className="pp-input" placeholder="Product name *" value={name} onChange={e => setName(e.target.value)} required />
            <textarea className="pp-input pp-textarea" placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
            <select className="pp-input pp-select" value={catId} onChange={e => setCatId(e.target.value)} required>
              <option value="">Select Category *</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* COLLECTION CHECKBOXES */}
          <div className="pp-section-card">
            <div className="pp-section-label">Add to Collections</div>
            <div className="pp-collections-grid">
              <label className={`pp-collection-box ${isBestSeller ? 'active' : ''}`}>
                <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} hidden />
                <span className="pp-col-icon">🏆</span>
                <span className="pp-col-name">Best Sellers</span>
                <span className={`pp-col-check ${isBestSeller ? 'on' : ''}`}>{isBestSeller ? '✓' : '+'}</span>
              </label>
              <label className={`pp-collection-box ${isTrending ? 'active' : ''}`}>
                <input type="checkbox" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} hidden />
                <span className="pp-col-icon">🔥</span>
                <span className="pp-col-name">Trending</span>
                <span className={`pp-col-check ${isTrending ? 'on' : ''}`}>{isTrending ? '✓' : '+'}</span>
              </label>
              <label className={`pp-collection-box ${isNewArrival ? 'active' : ''}`}>
                <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} hidden />
                <span className="pp-col-icon">✨</span>
                <span className="pp-col-name">New Arrivals</span>
                <span className={`pp-col-check ${isNewArrival ? 'on' : ''}`}>{isNewArrival ? '✓' : '+'}</span>
              </label>
            </div>
            {(isBestSeller || isTrending || isNewArrival) && (
              <div className="pp-col-selected">
                {isBestSeller && <span className="pp-col-tag best"> Best Seller</span>}
                {isTrending   && <span className="pp-col-tag trend"> Trending</span>}
                {isNewArrival && <span className="pp-col-tag new"> New Arrival</span>}
              </div>
            )}
          </div>

          <div className="pp-section-card">
            <div className="pp-section-label">Main Image</div>
            <div className="pp-main-upload-area" onClick={() => document.getElementById('mainImgInput').click()}>
              {mainPrev
                ? <img src={mainPrev} alt="main" className="pp-main-preview" />
                : <div className="pp-upload-placeholder"><span className="pp-upload-icon">⬆</span><span>Click to upload</span></div>
              }
            </div>
            <input id="mainImgInput" type="file" accept="image/*" hidden onChange={handleMainImg} />
            <div className="pp-price-row">
              <div className="pp-price-group">
                <label className="pp-price-label">MRP Price (₹)</label>
                <input className="pp-input pp-price-input" type="number" placeholder="0.00" value={mrp} onChange={e => setMrp(e.target.value)} />
              </div>
              <div className="pp-price-group">
                <label className="pp-price-label">Sales Price (₹)</label>
                <input className="pp-input pp-price-input" type="number" placeholder="0.00" value={sales} onChange={e => setSales(e.target.value)} />
              </div>
            </div>
            {mrp && sales && Number(mrp) > Number(sales) && (
              <div className="pp-discount-badge">{Math.round(((mrp - sales) / mrp) * 100)}% OFF</div>
            )}
          </div>

          <div className="pp-section-card">
            <div className="pp-section-label">
              Gallery Images <span className="pp-thumb-count">{totalThumbCount}/7</span>
            </div>
            <div className="pp-thumb-grid">
              {activeExisting.map(t => (
                <div key={`ex-${t.id}`} className="pp-thumb-item">
                  <img src={IMG + t.image} alt="" />
                  <button type="button" className="pp-thumb-del" onClick={() => removeExistingThumb(t.id)}>✕</button>
                </div>
              ))}
              {newThumbPrevs.map((src, i) => (
                <div key={`new-${i}`} className="pp-thumb-item pp-thumb-new">
                  <img src={src} alt="" />
                  <button type="button" className="pp-thumb-del" onClick={() => removeNewThumb(i)}>✕</button>
                  <span className="pp-thumb-badge">New</span>
                </div>
              ))}
              {totalThumbCount < 7 && (
                <div className="pp-thumb-add" onClick={() => thumbInput.current.click()}><span>+</span></div>
              )}
            </div>
            <input ref={thumbInput} type="file" accept="image/*" multiple hidden onChange={handleThumbs} />
            <p className="pp-thumb-hint">Max 7 images. {7 - totalThumbCount} slots remaining.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pp-form-right">
          <div className="pp-section-card pp-variants-card">
            <div className="pp-section-label">
              Product Variants
              <button type="button" className="pp-add-variant-btn" onClick={() => setVariants(prev => [...prev, emptyVariant()])}>+ Add</button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="pp-variant-row">
                <div className="pp-variant-header">
                  <span className="pp-variant-num">Variant {i + 1}</span>
                  {variants.length > 1 && (
                    <button type="button" className="pp-variant-del" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                  )}
                </div>
                <div className="pp-variant-fields">
                  <select className="pp-input pp-v-select" value={v.size} onChange={e => setVariantField(i, 'size', e.target.value)}>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className="pp-input" placeholder="Color" value={v.color} onChange={e => setVariantField(i, 'color', e.target.value)} />
                  <input className="pp-input" type="number" placeholder="MRP ₹" value={v.mrpPrice} onChange={e => setVariantField(i, 'mrpPrice', e.target.value)} />
                  <input className="pp-input" type="number" placeholder="Sale ₹" value={v.salesPrice} onChange={e => setVariantField(i, 'salesPrice', e.target.value)} />
                  <input className="pp-input" type="number" placeholder="Qty" value={v.quantity} onChange={e => setVariantField(i, 'quantity', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <div className="pp-form-actions">
            <button type="button" className="pp-btn-cancel" onClick={resetForm}>Discard</button>
            <button type="submit" className="pp-btn-save" disabled={saving}>
              {saving ? 'Saving...' : (editId ? 'Update Product' : 'Publish Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  // ══════════════════════════════════
  // VIEW
  // ══════════════════════════════════
  if (panel === 'view' && viewProd) return (
    <div className="pp-wrap">
      {confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}

      <div className="pp-form-topbar">
        <button className="pp-back-btn" onClick={() => { setViewProd(null); setPanel('list'); }}>← Back</button>
        <h2 className="pp-form-title">Product Detail</h2>
        <button className="pp-btn-edit-top" onClick={() => openEdit(viewProd)}>✏ Edit</button>
      </div>
      <div className="pp-view-grid">
        <div className="pp-view-media">
          {viewProd.mainImage && <img src={IMG + viewProd.mainImage} className="pp-view-main" alt={viewProd.name} />}
          {viewProd.thumbnails?.length > 0 && (
            <div className="pp-view-thumbs">
              {viewProd.thumbnails.map((t, i) => <img key={i} src={IMG + t.image} className="pp-view-thumb" alt="" />)}
            </div>
          )}
        </div>
        <div className="pp-view-info">
          <div className="pp-view-cat">{viewProd.category?.name || 'Uncategorised'}</div>
          <h2 className="pp-view-name">{viewProd.name}</h2>
          {(viewProd.isBestSeller || viewProd.isTrending || viewProd.isNewArrival) && (
            <div className="pp-col-selected" style={{ marginBottom: '14px' }}>
              {viewProd.isBestSeller && <span className="pp-col-tag best">🏆 Best Seller</span>}
              {viewProd.isTrending   && <span className="pp-col-tag trend">🔥 Trending</span>}
              {viewProd.isNewArrival && <span className="pp-col-tag new">✨ New Arrival</span>}
            </div>
          )}
          <p className="pp-view-desc">{viewProd.description || 'No description.'}</p>
          {(viewProd.mrpPrice || viewProd.salesPrice) && (
            <div className="pp-view-pricing">
              <div className="pp-view-price-label">Main Listing Price</div>
              <div className="pp-view-prices">
                {viewProd.mrpPrice   && <span className="pp-view-mrp">MRP ₹{Number(viewProd.mrpPrice).toLocaleString('en-IN')}</span>}
                {viewProd.salesPrice && <span className="pp-view-sales">₹{Number(viewProd.salesPrice).toLocaleString('en-IN')}</span>}
                {viewProd.mrpPrice && viewProd.salesPrice && Number(viewProd.mrpPrice) > Number(viewProd.salesPrice) && (
                  <span className="pp-view-off">{Math.round(((viewProd.mrpPrice - viewProd.salesPrice) / viewProd.mrpPrice) * 100)}% off</span>
                )}
              </div>
            </div>
          )}
          <div className="pp-view-stock-row">
            <span>Total Stock</span><strong>{viewProd.totalStock || 0} units</strong>
          </div>
          {(viewProd.totalStock || 0) < 10 && (
            <div className="pp-out-warn">⚠ {(viewProd.totalStock || 0) === 0 ? 'Out of Stock' : 'Low Stock — below 10 units'}</div>
          )}
          {viewProd.variants?.length > 0 && (
            <div className="pp-view-variants">
              <div className="pp-view-price-label" style={{ marginBottom: '10px' }}>Variants</div>
              <table className="pp-var-table">
                <thead><tr><th>Size</th><th>Color</th><th>MRP</th><th>Sale</th><th>Qty</th></tr></thead>
                <tbody>
                  {viewProd.variants.map((v, i) => (
                    <tr key={i}>
                      <td><span className="pp-size-tag">{v.size}</span></td>
                      <td>{v.color || '—'}</td>
                      <td className="pp-mrp-cell">₹{Number(v.mrpPrice).toLocaleString('en-IN')}</td>
                      <td className="pp-sale-cell">₹{Number(v.salesPrice).toLocaleString('en-IN')}</td>
                      <td><span className={`pp-qty-tag ${Number(v.quantity) < 10 ? 'low' : ''}`}>{v.quantity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════
  // TABLE LIST
  // ══════════════════════════════════
  return (
    <div className="pp-wrap">
      {/* ✅ Custom confirm dialog rendered here for list page */}
      {confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}

      <div className="pp-list-topbar">
        <div className="pp-list-title">
          <h2>Products</h2>
          <span className="pp-count-pill">{filtered.length} total</span>
        </div>
        {stockFilter !== 'all' && (
          <div className="pp-filter-pill">
            Showing <strong>{stockFilter === 'outofstock' ? 'Out of Stock' : stockFilter === 'lowstock' ? 'Low Stock' : 'In Stock'}</strong> products
          </div>
        )}
        <div className="pp-list-actions">
          <div className="pp-search-box">
            <span className="pp-search-icon">⌕</span>
            <input
              placeholder="Search by name or category..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="pp-btn-add" onClick={openAdd}>+ New Product</button>
        </div>
      </div>

      <div className="pp-table-card">
        <div className="pp-table-scroll">
          <table className="pp-table">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>#</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>MRP</th>
                <th>Sale Price</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th>Collections</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.length > 0 ? current.map((p, idx) => {
                const rowNum      = (safePage - 1) * PER_PAGE + idx + 1;
                const stock       = p.totalStock || 0;
                const stockStatus = stock >= 10 ? 'in' : stock > 0 ? 'low' : 'out';
                const stockLabel  = stock >= 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';
                return (
                  <tr key={p.id}>
                    <td className="pp-td-num">{rowNum}</td>
                    <td className="pp-td-img">
                      {p.mainImage
                        ? <img src={IMG + p.mainImage} className="pp-tbl-img" alt={p.name} />
                        : <div className="pp-tbl-no-img">—</div>
                      }
                    </td>
                    <td className="pp-td-name">
                      <div className="pp-name-main">{p.name}</div>
                      {p.description && (
                        <div className="pp-name-desc">
                          {p.description.slice(0, 40)}{p.description.length > 40 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td><span className="pp-cat-badge">{p.category?.name || '—'}</span></td>
                    <td className="pp-td-mrp">
                      {p.mrpPrice ? `₹${Number(p.mrpPrice).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="pp-td-sale">
                      {p.salesPrice ? `₹${Number(p.salesPrice).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pp-stock-num">{stock}</span>
                    </td>
                    <td>
                      <div className="pp-tbl-cols">
                        {p.isBestSeller && <span className="pp-tbl-col-tag best"> Best Seller</span>}
                        {p.isTrending   && <span className="pp-tbl-col-tag trend"> Trending</span>}
                        {p.isNewArrival && <span className="pp-tbl-col-tag new"> New Arrival</span>}
                        {!p.isBestSeller && !p.isTrending && !p.isNewArrival && (
                          <span style={{ color: '#b0c4da', fontSize: '12px' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td><span className={`pp-status-badge ${stockStatus}`}>{stockLabel}</span></td>
                    <td>
                      <div className="pp-action-btns">
                        <button className="pp-act-btn view" onClick={() => openView(p)} title="View">👁</button>
                        <button className="pp-act-btn edit" onClick={() => openEdit(p)} title="Edit">✏</button>
                        {/* ✅ handleDelete now uses custom confirm + toast */}
                        <button className="pp-act-btn del" onClick={() => handleDelete(p.id, p.name)} title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="10">
                    <div className="pp-empty">
                      <div className="pp-empty-icon">📦</div>
                      <div>{search ? 'No products match your search.' : 'No products yet. Click "+ New Product" to add one.'}</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pp-pagination">
            <span className="pp-page-info">
              Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} products
            </span>
            <div className="pp-page-btns">
              <button disabled={safePage === 1} onClick={() => setPage(1)} title="First page">«</button>
              <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)} title="Previous page">‹</button>
              {pageNumbers.map((n, i) =>
                n === '...'
                  ? <span key={`dot-${i}`} className="pp-dots">…</span>
                  : <button key={n} className={safePage === n ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
              )}
              <button disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)} title="Next page">›</button>
              <button disabled={safePage === totalPages} onClick={() => setPage(totalPages)} title="Last page">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
