import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowRight } from "react-icons/fa";
import './Banner.css';

import { API as _BAPI, IMG as IMAGE_BASE_URL } from '../../config';
const API_BASE_URL = `${_BAPI}/offer-banners/all`;

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(API_BASE_URL);
                setBanners(res.data);
            } catch (err) {
                console.error("Offer Banner fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (loading || banners.length === 0) return null;

    return (
        <section className="banner-area">

            {/* ── Section Heading ── */}
            <div className="banner-heading">
                <h2 className="heading-title">Exclusive Offers</h2>
                <div className="heading-bar"><span></span></div>
            </div>

            {/* ── Banner Grid ── */}
            <div className="banner-container">
                {banners.slice(0, 2).map((banner, index) => (
                    <div className="single-banner" key={banner.id || index}>

                        {/* 1. Background image */}
                        <div className="banner-img">
                            <img
                                src={`${IMAGE_BASE_URL}/${banner.image}`}
                                alt={banner.title || 'Offer Banner'}
                                loading="lazy"
                            />
                        </div>

                        {/* 2. Navy overlay */}
                        <div className="banner-overlay" />

                        {/* 3. Gradient for readability */}
                        <div className={`banner-gradient ${index === 0 ? 'gradient-right' : 'gradient-left'}`} />

                        {/* 4. Corner accent */}
                        <div className="banner-corner-accent" />

                        {/* 5. Content — subtitle + title + CTA stacked in ONE flex column */}
                        <div className={`banner-content ${index === 0 ? 'content-right' : 'content-left'}`}>

                            {banner.subtitle && (
                                <p className="banner-subtitle">{banner.subtitle}</p>
                            )}

                            <h3 className="banner-title">{banner.title}</h3>

                            <div className="banner-action">
                                <a
                                    href={banner.link || '#'}
                                    className="banner-link-text"
                                    aria-label={`Shop ${banner.title}`}
                                >
                                    {banner.buttonText || 'SHOP NOW'}
                                </a>
                                <a
                                    href={banner.link || '#'}
                                    className="banner-btn"
                                    aria-label="Go to offer"
                                >
                                    <FaArrowRight size={14} />
                                </a>
                            </div>

                        </div>

                    </div>
                ))}
            </div>

        </section>
    );
};

export default Banner;