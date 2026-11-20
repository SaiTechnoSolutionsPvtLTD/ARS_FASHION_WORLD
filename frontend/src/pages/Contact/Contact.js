import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../../config';
import { toast } from 'react-toastify';
import { 
  RiMapPin2Line, RiPhoneLine, RiTimeLine, 
  RiInstagramLine, RiWhatsappLine, RiMailSendLine 
} from "react-icons/ri"; 
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/contact/send`, formData);
      if (response.status === 201) {
        toast.success("Thank you! Your message has been sent.");
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-main-wrapper">
      <div className="contact-top-banner">
        <h1>Connect With ARS Fashion</h1>
        <p>Premium Quality. Professional Support. Personalized Fashion.</p>
      </div>

      <div className="contact-container fade-in-up">
        
        {/* Left Section: Professional Store Details */}
        <div className="contact-left-details">
          <h2 className="section-title">Store Information</h2>
          
          <div className="detail-card">
            <div className="detail-icon"><RiMapPin2Line /></div>
            <div className="detail-info">
              <h3>Our Location</h3>
              <p>Anna Nagar, Madurai,</p>
              <p>Tamil Nadu - 625020, India</p>
              <a href="https://maps.google.com" target="_blank" className="map-link">View on Google Maps</a>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon"><RiTimeLine /></div>
            <div className="detail-info">
              <h3>Opening Hours</h3>
              <p><strong>Mon - Sat:</strong> 09:30 AM - 09:00 PM</p>
              <p><strong>Sunday:</strong> 10:30 AM - 08:00 PM</p>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon"><RiPhoneLine /></div>
            <div className="detail-info">
              <h3>Call & Support</h3>
              <p>Main Store: +91 98XXX XXXXX</p>
              <p>Inquiries: +91 98XXX XXXXX</p>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon"><RiMailSendLine /></div>
            <div className="detail-info">
              <h3>Email Us</h3>
              <p className="email-link">support@arsfashion.com</p>
              <p className="email-link">info@arsfashion.com</p>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="social-connect-box">
            <h3>Follow Us</h3>
            <div className="social-icons-row">
              <a href="https://instagram.com/ars_fashion" target="_blank" className="social-icon insta">
                <RiInstagramLine /> <span>Instagram</span>
              </a>
              <a href="https://wa.me/9198XXXXXXXX" target="_blank" className="social-icon whatsapp">
                <RiWhatsappLine /> <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="contact-right-box">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="input-group">
              <label>Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Your Name" required />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" required />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+91 XXXX XXXX" required />
            </div>
            <div className="input-group">
              <label>Subject</label>
              <input name="subject" value={formData.subject} onChange={handleChange} type="text" placeholder="Ex: Order Issue / Product Inquiry" />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="How can we help you?" required></textarea>
            </div>
            <button type="submit" className="contact-submit-btn" disabled={loading}>
              {loading ? "SENDING..." : "SEND MESSAGE"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;