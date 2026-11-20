import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  RiEyeLine, RiDeleteBin6Line,
  RiArrowLeftSLine, RiArrowRightSLine, 
  RiFileList3Line, RiCloseLine, RiMapPinLine,
  RiTimeLine, RiShoppingBag3Line, RiUserLine,
  RiCalendarCheckLine, RiDownloadLine, RiFilter3Line
} from "react-icons/ri";
import './OrderPage.css';
import "./ReviewPage.css";
import { API, IMG } from '../config';

const ORDERS_PER_PAGE = 10;   // ← single source of truth


const loadJsPDF = () =>
  new Promise((resolve) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(script);
  });

const getShipping = (order) => {
  if (order.shippingSnapshot) return order.shippingSnapshot;
  const s = order.orderShipping;
  if (s) {
    return {
      name:        s.name        || order.Customer?.name  || 'Guest',
      phone:       s.phone       || order.Customer?.phone || null,
      addressLine: s.addressLine || null,
      city:        s.city        || null,
      district:    s.district    || null,
      state:       s.state       || null,
      pincode:     s.pincode     || null,
    };
  }
  const addr = order.Customer?.CustomerAddresses?.[0];
  if (addr) {
    return {
      name:        order.Customer?.name  || 'Guest',
      phone:       order.Customer?.phone || null,
      addressLine: [addr.houseNo, addr.street].filter(Boolean).join(', '),
      city:        addr.city     || null,
      district:    addr.district || null,
      state:       addr.state    || null,
      pincode:     addr.pincode  || null,
    };
  }
  return null;
};

const getShippingAddressStr = (order) => {
  const s = getShipping(order);
  if (!s) return null;
  const parts = [s.name, s.phone, s.addressLine, s.city, s.district, s.state, s.pincode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

/* ══════════════════════════════════════════════════════
   PDF GENERATOR
══════════════════════════════════════════════════════ */
const generateOrderPDF = async (orders, reportTitle = "Today's Order Report") => {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const BLACK      = [0, 0, 0];
  const WHITE      = [255, 255, 255];
  const DARK       = [20, 20, 20];
  const GRAY_DARK  = [60, 60, 60];
  const GRAY_MID   = [120, 120, 120];
  const GRAY_LIGHT = [200, 200, 200];
  const GRAY_BG    = [245, 245, 245];
  const GRAY_ROW   = [250, 250, 250];

  const PAGE_W    = 210;
  const PAGE_H    = 297;
  const MARGIN    = 16;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const LABEL_W   = 38;

  let y       = 0;
  let pageNum = 1;

  const sf = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };
  const sc = (r, g, b)      => doc.setTextColor(r, g, b);
  const fc = (r, g, b)      => doc.setFillColor(r, g, b);
  const dc = (r, g, b)      => doc.setDrawColor(r, g, b);
  const lw = (w)            => doc.setLineWidth(w);

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      + '  |  '
      + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const checkPage = (needed = 12) => {
    if (y + needed > PAGE_H - 16) {
      drawFooter();
      doc.addPage();
      pageNum++;
      y = 0;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    fc(...BLACK);
    doc.rect(0, 0, PAGE_W, 13, 'F');
    sf('bold', 10);
    sc(...WHITE);
    doc.text('ARS Fashion World', MARGIN, 9);
    sf('normal', 7.5);
    sc(...GRAY_LIGHT);
    doc.text(reportTitle, PAGE_W / 2, 9, { align: 'center' });
    doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, 9, { align: 'right' });
    y = 19;
  };

  const drawFooter = () => {
    dc(...GRAY_LIGHT);
    lw(0.3);
    doc.line(MARGIN, PAGE_H - 11, PAGE_W - MARGIN, PAGE_H - 11);
    sf('normal', 6.5);
    sc(...GRAY_MID);
    doc.text(
      `ARS Fashion World  |  Order Management  |  Generated: ${formatDate(new Date().toISOString())}`,
      PAGE_W / 2, PAGE_H - 7, { align: 'center' }
    );
  };

  const sectionHeading = (text) => {
    checkPage(14);
    y += 3;
    fc(...GRAY_BG);
    dc(...GRAY_LIGHT);
    lw(0.3);
    doc.rect(MARGIN, y, CONTENT_W, 8, 'FD');
    fc(...BLACK);
    doc.rect(MARGIN, y, 3, 8, 'F');
    sf('bold', 8);
    sc(...DARK);
    doc.text(text.toUpperCase(), MARGIN + 9, y + 5.5);
    y += 12;
  };

  const infoRow = (label, value) => {
    checkPage(7);
    sf('bold', 7.5);
    sc(...GRAY_MID);
    doc.text(label, MARGIN + 4, y);
    doc.text(':', MARGIN + LABEL_W - 2, y);
    sf('normal', 8.5);
    sc(...DARK);
    const lines = doc.splitTextToSize(String(value || '—'), CONTENT_W - LABEL_W - 6);
    doc.text(lines, MARGIN + LABEL_W + 2, y);
    y += lines.length * 5.5;
  };

  const twoCol = (left, right) => {
    const colW = (CONTENT_W / 2) - 4;
    let ly = y, ry = y;
    left.forEach(([lbl, val]) => {
      sf('bold', 7.5); sc(...GRAY_MID);
      doc.text(lbl, MARGIN + 2, ly);
      doc.text(':', MARGIN + 30, ly);
      sf('normal', 8.5); sc(...DARK);
      const lines = doc.splitTextToSize(String(val || '—'), colW - 32);
      doc.text(lines, MARGIN + 32, ly);
      ly += lines.length * 5.5;
    });
    right.forEach(([lbl, val]) => {
      sf('bold', 7.5); sc(...GRAY_MID);
      doc.text(lbl, MARGIN + CONTENT_W / 2 + 4, ry);
      doc.text(':', MARGIN + CONTENT_W / 2 + 34, ry);
      sf('normal', 8.5); sc(...DARK);
      const lines = doc.splitTextToSize(String(val || '—'), colW - 36);
      doc.text(lines, MARGIN + CONTENT_W / 2 + 36, ry);
      ry += lines.length * 5.5;
    });
    y = Math.max(ly, ry) + 3;
  };

  drawPageHeader();

  orders.forEach((order, idx) => {
    checkPage(70);

    fc(...BLACK);
    doc.roundedRect(MARGIN, y, CONTENT_W, 15, 1.5, 1.5, 'F');
    sf('bold', 11);
    sc(...WHITE);
    doc.text(`Order  #${order.orderId}`, MARGIN + 8, y + 9.5);
    sf('bold', 7.5);
    sc(...GRAY_LIGHT);
    doc.text((order.orderStatus || 'Pending').toUpperCase(), PAGE_W - MARGIN - 6, y + 7, { align: 'right' });
    sf('normal', 7);
    sc(...GRAY_LIGHT);
    doc.text(formatDate(order.createdAt), PAGE_W - MARGIN - 6, y + 13, { align: 'right' });
    y += 19;

    sectionHeading('Customer Information');
    twoCol(
      [
        ['Full Name', order.Customer?.name  || 'Guest User'],
        ['Email',     order.Customer?.email || '—'],
      ],
      [
        ['Mobile',      order.Customer?.phone || '—'],
        ['Customer ID', String(order.Customer?.id || '—')],
      ]
    );

    sectionHeading('Shipping / Delivery Address');
    const snap = getShipping(order);
    if (snap) {
      twoCol(
        [
          ['Name',    snap.name        || order.Customer?.name  || '—'],
          ['Mobile',  snap.phone       || order.Customer?.phone || '—'],
          ['Address', snap.addressLine || '—'],
        ],
        [
          ['City',     snap.city     || '—'],
          ['District', snap.district || '—'],
          ['State',    snap.state    || '—'],
          ['PIN Code', snap.pincode  || '—'],
        ]
      );
    } else {
      checkPage(8);
      sf('italic', 8); sc(...GRAY_MID);
      doc.text('Shipping address not available', PAGE_W / 2, y, { align: 'center' });
      y += 8;
    }

    sectionHeading('Order Items');

    checkPage(10);
    fc(...BLACK);
    doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
    sf('bold', 7.5);
    sc(...WHITE);

    const COL = {
      no:    MARGIN + 3,
      name:  MARGIN + 12,
      qty:   PAGE_W - MARGIN - 54,
      unit:  PAGE_W - MARGIN - 32,
      sub:   PAGE_W - MARGIN - 3,
    };
    doc.text('#',             COL.no,   y + 5.5);
    doc.text('Product Name',  COL.name, y + 5.5);
    doc.text('Qty',           COL.qty,  y + 5.5, { align: 'center' });
    doc.text('Unit Price',    COL.unit, y + 5.5, { align: 'center' });
    doc.text('Subtotal',      COL.sub,  y + 5.5, { align: 'right' });
    y += 8;

    const slots = order.slots || [];
    slots.forEach((item, i) => {
      checkPage(9);
      if (i % 2 === 0) { fc(...GRAY_ROW); doc.rect(MARGIN, y, CONTENT_W, 8, 'F'); }
      dc(...GRAY_LIGHT); lw(0.15);
      doc.line(MARGIN, y + 8, MARGIN + CONTENT_W, y + 8);

      const subtotal = Number(item.salesPrice || 0) * Number(item.quantity || 1);
      const nameStr  = doc.splitTextToSize(
        item.Product?.name || item.productName || 'Product', 70
      )[0];

      sf('normal', 7.5); sc(...GRAY_MID);
      doc.text(String(i + 1), COL.no, y + 5.5);
      sf('normal', 8); sc(...DARK);
      doc.text(nameStr, COL.name, y + 5.5);
      sf('bold', 8); sc(...DARK);
      doc.text(String(item.quantity), COL.qty, y + 5.5, { align: 'center' });
      sf('normal', 8);
      doc.text('Rs.' + Number(item.salesPrice).toLocaleString('en-IN'), COL.unit, y + 5.5, { align: 'center' });
      sf('bold', 8.5);
      doc.text('Rs.' + subtotal.toLocaleString('en-IN'), COL.sub, y + 5.5, { align: 'right' });
      y += 8;
    });

    checkPage(8);
    dc(...GRAY_LIGHT); lw(0.2);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    const itemsSubtotal = slots.reduce(
      (a, item) => a + Number(item.salesPrice || 0) * Number(item.quantity || 1), 0
    );
    fc(...GRAY_ROW);
    doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
    sf('normal', 8); sc(...GRAY_MID);
    doc.text('Items Subtotal', COL.name, y + 5.5);
    sf('normal', 8.5); sc(...DARK);
    doc.text('Rs.' + itemsSubtotal.toLocaleString('en-IN'), COL.sub, y + 5.5, { align: 'right' });
    y += 8;

    checkPage(8);
    const deliveryCharge = Number(order.totalAmount || 0) - itemsSubtotal;
    fc(...GRAY_ROW);
    doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
    dc(...GRAY_LIGHT); lw(0.15);
    doc.line(MARGIN, y + 8, MARGIN + CONTENT_W, y + 8);
    sf('normal', 8); sc(...GRAY_MID);
    doc.text('Delivery Charge', COL.name, y + 5.5);
    if (deliveryCharge <= 0) {
      sf('bold', 8.5); sc(...DARK);
      doc.text('FREE', COL.sub, y + 5.5, { align: 'right' });
    } else {
      sf('normal', 8.5); sc(...DARK);
      doc.text('Rs.' + deliveryCharge.toLocaleString('en-IN'), COL.sub, y + 5.5, { align: 'right' });
    }
    y += 8;

    checkPage(13);
    fc(...BLACK);
    doc.roundedRect(MARGIN, y, CONTENT_W, 12, 1, 1, 'F');
    sf('bold', 9); sc(...WHITE);
    doc.text('GRAND TOTAL', MARGIN + 8, y + 8);
    sf('bold', 11); sc(...WHITE);
    doc.text('Rs. ' + Number(order.totalAmount).toLocaleString('en-IN'), PAGE_W - MARGIN - 6, y + 8, { align: 'right' });
    y += 16;

    if (idx < orders.length - 1) {
      checkPage(12);
      y += 3;
      dc(...GRAY_LIGHT); lw(0.4);
      doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
      y += 8;
    }
  });

  drawFooter();

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    fc(...BLACK);
    doc.rect(PAGE_W - MARGIN - 22, 0, 40, 13, 'F');
    sf('normal', 7); sc(...GRAY_LIGHT);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, 9, { align: 'right' });
  }

  const filename = `ARS_Orders_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
};

/* ──────────────────────────────────────────────────
   REACT COMPONENT
────────────────────────────────────────────────── */
const OrderPage = ({ orderStatusFilter }) => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrderList, setTodayOrderList] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const query        = new URLSearchParams(location.search);
  const filter       = query.get('filter');
  const statusQuery  = query.get('status');
  const orderIdParam = query.get('orderId');
  const isTodayFilter = filter === 'today';

  const effectiveStatus = statusFilter === 'All'
    ? (statusQuery || orderStatusFilter || '')
    : statusFilter;

  useEffect(() => { fetchOrders(); }, [effectiveStatus, currentPage, location.search]);
  useEffect(() => { fetchTodayStats(); }, []);
  useEffect(() => {
    if (!loading && orderIdParam && orders.length > 0) {
      const match = orders.find(
        o => String(o.orderId) === String(orderIdParam) || String(o.id) === String(orderIdParam)
      );
      if (match) setSelectedOrder(match);
    }
  }, [loading, orders, orderIdParam]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/orders/all`, {
        params: {
          status: effectiveStatus,
          page:   currentPage,
          limit:  ORDERS_PER_PAGE,          // ← send limit to backend
          filter: isTodayFilter ? 'today' : undefined,
        }
      });
      if (res.data?.orders) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
        setTotalOrders(res.data.totalOrders || res.data.orders.length);
        const rev = res.data.orders.reduce((a, o) => a + Number(o.totalAmount || 0), 0);
        setTotalRevenue(rev);
      }
    } catch (err) {
      console.error('API Error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const res = await axios.get(`${API}/orders/all`, {
        params: { filter: 'today', page: 1, limit: 1000 }
      });
      if (res.data?.orders) {
        const list = res.data.orders;
        setTodayOrderList(list);
        setTodayOrders(list.length);
        setTodayRevenue(list.reduce((a, o) => a + Number(o.totalAmount || 0), 0));
      }
    } catch (err) {
      console.error("Today stats error:", err);
    }
  };

  const handleDownloadPDF = async () => {
    if (todayOrderList.length === 0) {
      toast.info("No today's orders to download.");
      return;
    }
    setPdfLoading(true);
    try {
      const filename = await generateOrderPDF(todayOrderList, "Today's Order Report");
      toast.success(`PDF downloaded: ${filename}`);
    } catch (err) {
      console.error('PDF Error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API}/orders/update/${id}`, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('Update Error:', err);
      toast.error('Failed to update order status');
    }
  };

  const deleteOrder = (id) => {
    setDeleteTarget(id);
    toast.warn(
      <div style={{ lineHeight: 1.5 }}>
        <strong>Delete this order?</strong>
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
      { autoClose: false, closeOnClick: false, closeButton: false, icon: '' }
    );
  };

  const confirmDelete = async (id) => {
    toast.dismiss();
    setDeleteTarget(null);
    try {
      await axios.delete(`${API}/orders/delete/${id}`);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (err) {
      console.error('Delete Error:', err);
      toast.error('Failed to delete order');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      + '  ·  '
      + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  /* ── Pagination helpers ── */
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Build page number buttons (max 5 visible) */
  const pageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="ars-order-wrapper">
      <div className="ars-main-card">
        <div className="card-header">
          <div className="title-area">
            <h1>Order <span className="gold-text">Management</span></h1>
            <p className="status-indicator">
              Showing: <b>{effectiveStatus || 'All'}</b>
              {isTodayFilter ? ' today' : ''} Orders
            </p>
          </div>

          <div className="order-stats">
            <div className="stat-box">
              <p>Total Orders</p>
              <h3>{totalOrders}</h3>
            </div>
            <div className="stat-box">
              <p>Total Revenue</p>
              <h3>₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>

            <div className="stat-box stat-box--today">
              <div className="today-stat-top">
                <RiCalendarCheckLine className="today-icon" />
                <p>Today's Orders</p>
              </div>
              <h3>{todayOrders}</h3>
              <span className="today-revenue">₹{todayRevenue.toLocaleString('en-IN')}</span>
              <button
                className="pdf-download-btn"
                onClick={handleDownloadPDF}
                disabled={pdfLoading || todayOrders === 0}
                title="Download today's orders as PDF"
              >
                {pdfLoading
                  ? <span className="pdf-spinner" />
                  : <><RiDownloadLine /> Download PDF</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Status Filter Dropdown ── */}
        <div className="order-filter-bar">
          <div className="order-filter-dropdown-wrap">
            <RiFilter3Line className="filter-icon" />
            <select
              className="order-filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <span className="filter-result-count">
            {totalOrders} orders &nbsp;·&nbsp; Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="table-responsive">
          <table className="ars-premium-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10">Loading Orders...</td></tr>
              ) : orders.length > 0 ? (
                orders.map((order, idx) => (
                  <tr key={order.orderId} data-status={order.orderStatus}>
                    {/* Row number relative to current page */}
                    <td className="row-num">
                      {(currentPage - 1) * ORDERS_PER_PAGE + idx + 1}
                    </td>
                    <td><span className="id-txt">#{order.orderId}</span></td>
                    <td>
                      <div className="name-txt">{order.Customer?.name || 'Guest User'}</div>
                      <div className="phone-sub">{order.Customer?.phone || 'No Phone'}</div>
                    </td>
                    <td className="date-txt">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="amount-txt">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                    <td>
                      <select
                        className={`status-select ${order.orderStatus?.toLowerCase()}`}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="action-cell">
                      <button className="eye-btn" onClick={() => setSelectedOrder(order)} title="View Order">
                        <RiEyeLine />
                      </button>
                      <button
                        className="del-btn"
                        onClick={() => deleteOrder(order.orderId)}
                        title="Delete Order"
                        disabled={deleteTarget === order.orderId}
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-10">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="pagination-footer">
          <span className="page-info">
            Showing {orders.length === 0 ? 0 : (currentPage - 1) * ORDERS_PER_PAGE + 1}
            –{Math.min(currentPage * ORDERS_PER_PAGE, totalOrders)} of {totalOrders} orders
          </span>

          <div className="p-btns">
            <button disabled={currentPage === 1} onClick={() => goToPage(1)} title="First page">
              «
            </button>
            <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
              <RiArrowLeftSLine /> Prev
            </button>

            {pageNumbers().map(n => (
              <button
                key={n}
                className={n === currentPage ? 'p-btn-active' : ''}
                onClick={() => goToPage(n)}
              >
                {n}
              </button>
            ))}

            <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
              Next <RiArrowRightSLine />
            </button>
            <button disabled={currentPage === totalPages} onClick={() => goToPage(totalPages)} title="Last page">
              »
            </button>
          </div>
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (() => {
        const snap   = getShipping(selectedOrder);
        const addrStr = getShippingAddressStr(selectedOrder);
        return (
          <div className="ars-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="ars-modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <RiFileList3Line className="gold-text" />
                  Order <span className="gold-text">#{selectedOrder.orderId}</span>
                </h3>
                <div className="modal-header-right">
                  <span className={`modal-status-badge ${selectedOrder.orderStatus?.toLowerCase()}`}>
                    {selectedOrder.orderStatus}
                  </span>
                  <button
                    className="modal-pdf-btn"
                    title="Download this order as PDF"
                    onClick={async () => {
                      setPdfLoading(true);
                      try {
                        await generateOrderPDF([selectedOrder], `Order #${selectedOrder.orderId} Report`);
                        toast.success('Order PDF downloaded');
                      } catch { toast.error('PDF generation failed'); }
                      finally { setPdfLoading(false); }
                    }}
                  >
                    <RiDownloadLine /> PDF
                  </button>
                  <button className="close-x" onClick={() => setSelectedOrder(null)}>
                    <RiCloseLine />
                  </button>
                </div>
              </div>

              <div className="modal-time-bar">
                <RiTimeLine />
                <span>Order Placed: <strong>{formatDateTime(selectedOrder.createdAt)}</strong></span>
              </div>

              <div className="modal-grid">
                <div className="modal-section">
                  <h4><RiUserLine style={{ marginRight: 6, verticalAlign: 'middle' }} />Customer Info</h4>
                  <p>{selectedOrder.Customer?.name || 'Guest User'}</p>
                  <p>{selectedOrder.Customer?.email || '—'}</p>
                  <p>{selectedOrder.Customer?.phone || '—'}</p>
                </div>

                <div className="modal-section">
                  <h4><RiMapPinLine style={{ marginRight: 6, verticalAlign: 'middle' }} />Shipping Address</h4>
                  {snap ? (
                    <>
                      {snap.name        && <p><strong>{snap.name}</strong></p>}
                      {snap.phone       && <p>{snap.phone}</p>}
                      {snap.addressLine && <p>{snap.addressLine}</p>}
                      <p>{[snap.district, snap.city, snap.state, snap.pincode].filter(Boolean).join(', ')}</p>
                    </>
                  ) : (
                    <p className="modal-no-data">Address not available</p>
                  )}
                </div>

                <div className="modal-section modal-section--full">
                  <h4><RiShoppingBag3Line style={{ marginRight: 6, verticalAlign: 'middle' }} />Order Items</h4>
                  <div className="modal-items-list">
                    {selectedOrder.slots?.length > 0 ? (
                      selectedOrder.slots.map((item, i) => (
                        <div key={i} className="modal-item-row">
                          <span className="modal-item-dot" />
                          <span className="modal-item-name">{item.Product?.name || item.productName || 'Product'}</span>
                          <span className="modal-item-qty">× {item.quantity}</span>
                          <span className="modal-item-price">
                            ₹{Number(item.salesPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="modal-no-data">No items found</p>
                    )}
                  </div>
                  <div className="modal-total-row">
                    <span>Grand Total</span>
                    <span className="modal-total-amount">
                      ₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OrderPage;