import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    RiEyeLine, RiSearchLine, RiCloseLine,
    RiUserLine, RiMapPinLine, RiProfileLine,
    RiArrowLeftSLine, RiArrowRightSLine,
    RiArrowDownSLine, RiArrowUpSLine,
} from "react-icons/ri";
import './CustomerPage.css';
import { API } from '../config';


const CustomerPage = () => {
    const [customers,   setCustomers]   = useState([]);
    const [searchTerm,  setSearchTerm]  = useState('');
    const [selectedCust, setSelectedCust] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const customersPerPage = 10;

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`${API}/customers/all`);
            setCustomers(res.data);
        } catch (err) {
            toast.error('Failed to load customers');
            console.error(err);
        }
    };

    const toggleExpand = (custId) =>
        setExpandedRow(prev => prev === custId ? null : custId);

    const filtered = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id?.toString().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages   = Math.ceil(filtered.length / customersPerPage) || 1;
    const safePage     = currentPage > totalPages ? 1 : currentPage;
    const currentItems = filtered.slice((safePage - 1) * customersPerPage, safePage * customersPerPage);

    return (
        <div className="ars-customer-wrapper">

            <div className="ars-main-card">

                {/* HEADER */}
                <div className="card-header">
                    <div className="title-area">
                        <h1>Customer <span className="gold-text">Database</span></h1>
                        <p>Total Members: {filtered.length}</p>
                    </div>
                    <div className="search-bar-curved">
                        <RiSearchLine />
                        <input
                            type="text"
                            placeholder="Search by Name, Email or ID..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="ars-premium-table">
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Customer Name</th>
                                <th>Contact</th>
                                <th>Shipping Addresses</th>
                                <th className="text-center">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? currentItems.map((cust) => (
                                <React.Fragment key={cust.id}>
                                    {/* Main row */}
                                    <tr className={expandedRow === cust.id ? 'row-expanded' : ''}>
                                        <td><span className="id-txt"># {cust.id}</span></td>
                                        <td><span className="name-txt">{cust.name}</span></td>
                                        <td>
                                            <div className="email-sub">{cust.email}</div>
                                            <div className="phone-sub">{cust.phone}</div>
                                        </td>
                                        <td>
                                            {cust.ShippingAddresses?.length > 0 ? (
                                                <button
                                                    className={`ship-expand-btn ${expandedRow === cust.id ? 'active' : ''}`}
                                                    onClick={() => toggleExpand(cust.id)}
                                                >
                                                    <RiMapPinLine />
                                                    {cust.ShippingAddresses.length} address{cust.ShippingAddresses.length > 1 ? 'es' : ''}
                                                    {expandedRow === cust.id
                                                        ? <RiArrowUpSLine />
                                                        : <RiArrowDownSLine />}
                                                </button>
                                            ) : <span className="no-val">None</span>}
                                        </td>
                                        <td className="action-cell">
                                            <button className="eye-btn" onClick={() => setSelectedCust(cust)} title="View details">
                                                <RiEyeLine />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded shipping sub-panel — view only */}
                                    {expandedRow === cust.id && (
                                        <tr className="expanded-sub-row">
                                            <td colSpan={5} style={{ padding: 0 }}>
                                                <div className="shipping-expand-panel">
                                                    <div className="sep-header">
                                                        <RiMapPinLine className="sep-icon" />
                                                        Saved Shipping Addresses for <strong>&nbsp;{cust.name}</strong>
                                                        <span className="sep-count">
                                                            {cust.ShippingAddresses.length} saved
                                                        </span>
                                                    </div>
                                                    <div className="sa-list">
                                                        {cust.ShippingAddresses.map((addr, i) => (
                                                            <div className="sa-row" key={addr.id}>
                                                                <div className="sa-row-left">
                                                                    <span className="sa-num">#{i + 1}</span>
                                                                    <div className="sa-details">
                                                                        <span className="sa-name">{addr.name}</span>
                                                                        <span className="sa-phone">{addr.phone}</span>
                                                                        <span className="sa-addr">
                                                                            {[addr.addressLine, addr.city, addr.district, addr.state]
                                                                                .filter(Boolean).join(', ')}
                                                                            {addr.pincode ? ` - ${addr.pincode}` : ''}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="empty-row">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="pagination-footer">
                    <span>Page {safePage} of {totalPages} · {filtered.length} customers</span>
                    <div className="p-btns">
                        <button disabled={safePage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                            <RiArrowLeftSLine />
                        </button>
                        <button disabled={safePage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                            <RiArrowRightSLine />
                        </button>
                    </div>
                </div>
            </div>

            {/* FULL DETAIL MODAL — view only */}
            {selectedCust && (
                <div className="ars-overlay" onClick={() => setSelectedCust(null)}>
                    <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header-black">
                            <div className="cust-identity">
                                <RiProfileLine className="gold-text" size={20} />
                                <h3>
                                    {selectedCust.name}
                                    <span className="id-badge">ID: {selectedCust.id}</span>
                                </h3>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedCust(null)}>
                                <RiCloseLine size={18} />
                            </button>
                        </div>

                        <div className="modal-body-grid">
                            <div className="address-section register-box">
                                <h4 className="sub-heading">
                                    <RiUserLine /> Registered Info
                                </h4>
                                <div className="addr-details">
                                    <p><strong>Name</strong> {selectedCust.name}</p>
                                    <p><strong>Email</strong> {selectedCust.email}</p>
                                    <p><strong>Phone</strong> {selectedCust.phone}</p>
                                </div>
                                {selectedCust.CustomerAddresses?.length > 0 && (
                                    <>
                                        <div style={{ borderTop: '1px solid #dce6f7', margin: '12px 0' }} />
                                        {selectedCust.CustomerAddresses.map(addr => (
                                            <div className="addr-details" key={addr.id}>
                                                {addr.houseNo && <p><strong>House No</strong> {addr.houseNo}</p>}
                                                {addr.street  && <p><strong>Street</strong>   {addr.street}</p>}
                                                {addr.city    && <p><strong>City</strong>     {addr.city}</p>}
                                                {addr.state   && <p><strong>State</strong>    {addr.state}</p>}
                                                {addr.pincode && <p><strong>Pincode</strong>  {addr.pincode}</p>}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="address-section shipping-box">
                                <h4 className="sub-heading">
                                    <RiMapPinLine /> Shipping Addresses
                                    <span className="ship-count-inline">
                                        ({selectedCust.ShippingAddresses?.length || 0})
                                    </span>
                                </h4>
                                {selectedCust.ShippingAddresses?.length > 0 ? (
                                    <div className="shipping-list">
                                        {selectedCust.ShippingAddresses.map((addr, i) => (
                                            <div className="shipping-card" key={addr.id}>
                                                <div className="shipping-card-num">Address #{i + 1}</div>
                                                <div className="addr-details">
                                                    {addr.name        && <p><strong>Name</strong>    {addr.name}</p>}
                                                    {addr.phone       && <p><strong>Phone</strong>   {addr.phone}</p>}
                                                    {addr.addressLine && <p><strong>Address</strong> {addr.addressLine}</p>}
                                                    {addr.city        && <p><strong>City</strong>    {addr.city}</p>}
                                                    {addr.district    && <p><strong>District</strong>{addr.district}</p>}
                                                    {addr.state       && <p><strong>State</strong>   {addr.state}</p>}
                                                    {addr.pincode     && <p><strong>Pincode</strong> {addr.pincode}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="no-data">No shipping addresses used yet.</p>}
                            </div>
                        </div>

                        <div className="modal-footer-info">
                            <span>{selectedCust.email}</span>
                            <span>{selectedCust.phone}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPage;