import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DealOfDay.css';

import { API as _DDAPI } from '../../config';
const API_BASE = _DDAPI.replace('/api', '');

const DealOfDay = () => {
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
       
        axios.get(`${API_BASE}/api/deals/active`)
            .then(res => setDeal(res.data))
            .catch(err => console.error("Deal fetch error:", err));
    }, []);

    useEffect(() => {
        if (!deal || !deal.expiryDate) return;

        const timer = setInterval(() => {
            const target = new Date(deal.expiryDate).getTime();
            const now = new Date().getTime();
            const gap = target - now;

            if (gap < 0) {
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(gap / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((gap % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [deal]);

    if (!deal) return null;

    return (
        <section className="deal-container">
            <div className="deal-wrapper">
                <div className="deal-image-side">
                    <img src={`${API_BASE}/uploads/${deal.image}`} alt={deal.title} />
                    <div className="deal-badge">LIMITED TIME</div>
                </div>

                <div className="deal-content-side">
                    <span className="deal-subtitle">Don't Miss Out</span>
                    <h2 className="deal-title">{deal.title}</h2>
                    <p className="deal-desc">{deal.description}</p>

                    <div className="timer-grid">
                        <div className="timer-box">
                            <span className="t-val">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="t-lbl">DAYS</span>
                        </div>
                        <div className="timer-box">
                            <span className="t-val">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="t-lbl">HRS</span>
                        </div>
                        <div className="timer-box">
                            <span className="t-val">{String(timeLeft.mins).padStart(2, '0')}</span>
                            <span className="t-lbl">MINS</span>
                        </div>
                        <div className="timer-box">
                            <span className="t-val">{String(timeLeft.secs).padStart(2, '0')}</span>
                            <span className="t-lbl">SECS</span>
                        </div>
                    </div>

                    <button className="deal-cta" onClick={() => navigate(deal.buttonLink)}>
                        {deal.buttonText || 'SHOP THE DEAL'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default DealOfDay;