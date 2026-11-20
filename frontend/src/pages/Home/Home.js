import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Home.css';

import ProductSection from '../../components/Products/ProductSection';
import DealOfDay from '../../components/DealOfDay/DealOfDay';
import TrendingProducts from '../../components/TrendingProducts/TrendingProducts';
import BlogSection from '../../components/Blog/Blog';
import Banner from '../../components/Banner/Banner';

import { useCategories } from '../../context/CategoryContext';

import { API as _HAPI, IMG as IMAGE_BASE_URL } from '../../config';
const BANNERS_API = `${_HAPI}/banners/all`;

// Alternate card themes: dark / light for every odd/even card
const THEMES = ['dark', 'light', 'dark', 'light'];

const Hero = () => {
  const [banners, setBanners]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [swiperReady, setSwiperReady] = useState(false);

  const { categories, loading: catLoading, toSlug } = useCategories();

  useEffect(() => {
    axios.get(BANNERS_API)
      .then(res => setBanners(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Banner fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── First 4 active categories from backend — fully dynamic ──
  const quickCats = catLoading
    ? []
    : categories.slice(0, 4).map((cat, idx) => ({
        id:    cat.id,
        name:  cat.name,
        theme: THEMES[idx] || 'dark',
        link:  `/collections/${toSlug(cat.name)}`,
      }));

  if (loading) return <div className="hero-loader">Loading ARS Fashion...</div>;

  return (
    <div className="hero-section-wrapper">

      {/* ── HERO SWIPER ── */}
      <section className="hero-section">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={banners.length > 1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          speed={800}
          watchSlidesProgress={true}
          onSwiper={() => setSwiperReady(true)}
          className={`hero-swiper ${swiperReady ? 'swiper-ready' : ''}`}
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner._id || banner.id}>
              <div className="hero-container">
                <div className="hero-content">
                  <h4 className="hero-subtitle animate-slide-right">
                    {banner.subtitle || 'Smart Products'}
                  </h4>
                  <h1 className="hero-title">
                    <div className="animate-reveal-1">{banner.title}</div>
                  </h1>
                  <p className="hero-desc animate-reveal-2">{banner.description}</p>
                  <div className="hero-btn-wrapper animate-reveal-3">
                    <Link to={banner.link || '/shop'} className="hero-btn">
                      {banner.buttonText || 'SHOP NOW'}
                    </Link>
                  </div>
                </div>
                <div className="hero-image-container animate-zoom-in">
                  <img
                    src={`${IMAGE_BASE_URL}/${banner.image}`}
                    alt={banner.title}
                    className="hero-img-long"
                    loading="eager"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── CATEGORY GRID — first 4 from backend ── */}
      {quickCats.length > 0 && (
        <div className="cat-rectangle-grid">
          {quickCats.map((cat) => (
            <Link
              to={cat.link}
              key={cat.id}
              className={`cat-rect-card ${cat.theme === 'dark' ? 'bg-navy' : 'bg-offwhite'}`}
            >
              <div className="cat-rect-content">
                <h3 className={cat.theme === 'dark' ? 'text-white' : 'text-navy'}>
                  {cat.name}
                </h3>
                <div className="cat-arrow-circle">
                  <ArrowRight
                    size={20}
                    className={cat.theme === 'dark' ? 'icon-gold' : 'icon-navy'}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── OTHER SECTIONS ── */}
      <ProductSection />
      <Banner />
      <TrendingProducts />
      <DealOfDay />
      <BlogSection />

    </div>
  );
};

export default Hero;