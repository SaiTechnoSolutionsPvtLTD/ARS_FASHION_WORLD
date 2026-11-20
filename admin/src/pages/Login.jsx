import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RiMailLine, RiLockPasswordLine, RiLoginCircleLine, RiErrorWarningLine } from 'react-icons/ri';
import { API } from '../config';
import './Login.css';

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/admin/login`, { email, password });

      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminId',    res.data.adminId);
        localStorage.setItem('adminName',  res.data.adminName || 'Admin');
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;

        toast.success('✅ Login successful! Redirecting...', {
          autoClose: 1500,
          onClose: () => { window.location.href = '/dashboard'; },
        });
      }
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message || '';

      // ── Match error type from backend status / message ──
      if (
        status === 404 ||
        message.toLowerCase().includes('email') ||
        message.toLowerCase().includes('user') ||
        message.toLowerCase().includes('not found')
      ) {
        toast.error('📧 No account found with this email address.', { autoClose: 4000 });
      } else if (
        status === 401 ||
        message.toLowerCase().includes('password') ||
        message.toLowerCase().includes('invalid') ||
        message.toLowerCase().includes('incorrect')
      ) {
        toast.error('🔒 Incorrect password. Please try again.', { autoClose: 4000 });
      } else {
        toast.error('❌ Login failed. Please try again.', { autoClose: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-branding">
          <div className="ars-logo">ARS</div>
          <h2>Admin Login</h2>
          <p>Enter your credentials to access the panel</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">

          <div className="input-field">
            <RiMailLine className="icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <RiLockPasswordLine className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : <><RiLoginCircleLine /> Login</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;