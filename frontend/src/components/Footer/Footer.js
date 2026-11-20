/* src/components/Footer/Footer.js */
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'; // Optional: Use react-icons for better scaling
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <img src="/assets/logo.png" alt="ARS Logo" className="footer-logo" />
            <p className="brand-desc">
              Your ultimate destination for premium fashion and style. Crafted with passion, delivered with care.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Collection</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Follow Us */}
          <div className="footer-col">
            <h3 className="footer-title">Follow Us</h3>
            <ul className="footer-links social-text-links">
              <li><a href="#fb">Facebook</a></li>
              <li><a href="#tw">Twitter</a></li>
              <li><a href="#ig">Instagram</a></li>
              <li><a href="#yt">Youtube</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col newsletter-col">
            <h3 className="footer-title">Newsletter</h3>
            <p className="newsletter-text">Get email updates about our latest collections and exclusive offers.</p>
            <div className="subscribe-box">
              <input type="email" placeholder="Email address..." />
              <button type="submit">Subscribe</button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>All Rights Reserved &copy; 2026 <span>ARS Fashion</span></p>
          <div className="social-circles">
             <a href="#fb"><FaFacebookF /></a>
             <a href="#tw"><FaTwitter /></a>
          </div>
          <p>Developed by <a href="https://saitechnosolutions.com/" target="_blank">Sai Techno Solution</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;