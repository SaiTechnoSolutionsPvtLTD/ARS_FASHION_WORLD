import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCart, getPendingCartItem, clearPendingCartItem } from "../../context/CartContext";
import toast, { Toaster } from "react-hot-toast";
import "./Register.css";

import { API } from '../../config';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const { onLogin, addPendingCartItem } = useCart();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Where to go after login — default to the page they came from, or "/"
  const redirectTo  = location.state?.from || "/";
  const pendingCart = location.state?.pendingCart;
  const productName = location.state?.productName;
  const successMsg  = location.state?.message || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    if (name === 'password') {
      // Only allow digits, max 6
      filteredValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setForm({ ...form, [name]: filteredValue });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const passwordRegex = /^\d{6}$/;
    if (!passwordRegex.test(form.password)) {
      setError("Password must be exactly 6 numbers");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/customers/login`, form);
      const { customer, token } = res.data;

      // 1. Save auth
      login(customer, token, { onLogin });

      // 2. Check pending cart item
      const pending = getPendingCartItem();
      if (pending) {
        const name = pending.product?.name || productName;

        // Fetch this customer's existing cart from backend FIRST
        let existingCart = [];
        try {
          const cartRes = await axios.get(`${API}/cart/${customer.id}`);
          existingCart = cartRes.data || [];
        } catch {}

        // Check if the pending product is already in their cart
        const alreadyExists = existingCart.some(
          (item) =>
            item.productId === pending.product.id &&
            (item.variantId || null) === (pending.variantId || null)
        );

        if (alreadyExists) {
          // Already in cart — DO NOT add, DO NOT increase quantity
          clearPendingCartItem();
          toast(
            `"${name}" is already in your cart!`,
            {
              icon: "🛒",
              duration: 4000,
              style: {
                background: "#fff8e1",
                color: "#7a5c00",
                fontWeight: 600,
                border: "1.5px solid #d1a309",
              },
            }
          );
        } else {
          //  Not in cart — add it fresh
          await addPendingCartItem(customer.id);
          toast.success(`"${name}" added to cart!`, {
            duration: 3000,
            style: { background: "#00044a", color: "#d1a309", fontWeight: 600 },
          });
        }
        navigate("/cart");
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="reg-bg">
      <Toaster position="top-center" />
      <div className="reg-glass-box">
        <h2 className="reg-title">Welcome Back</h2>
        <p className="reg-subtitle">Login to continue shopping</p>

        {/* Show banner when redirected from "Add to Cart" */}
        {pendingCart && productName && (
          <div style={{
            background: '#fff8e1', border: '1.5px solid #d1a309',
            color: '#7a5c00', borderRadius: 10, padding: '12px 16px',
            marginBottom: 16, fontSize: 14, fontWeight: 500, textAlign: 'center',
          }}>
            🛒 Login to add <strong>"{productName}"</strong> to your cart
            <div style={{ fontSize: 12, marginTop: 4, color: '#a07a00' }}>
              If it's already in your cart, we'll take you there directly.
            </div>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#e8f5e9', border: '1px solid #a5d6a7',
            color: '#2e7d32', borderRadius: 8, padding: '10px 16px',
            marginBottom: 14, fontSize: 14, fontWeight: 500, textAlign: 'center',
          }}>
            {successMsg}
          </div>
        )}

        {error && <div className="reg-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input name="email" type="email" placeholder="Registered Email *"
            className="reg-input" value={form.email} onChange={handleChange} required />

          <input name="password" type="password" placeholder="Password (exactly 6 numbers) *"
            className="reg-input" value={form.password} onChange={handleChange} required />

          <button type="submit" className="reg-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p className="reg-footer-text" style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/forgot-password" className="reg-link" style={{ color: '#d1a309', fontSize: 13 }}>
            Forgot Password?
          </Link>
        </p>
        <p className="reg-footer-text">
          New customer?{" "}
          {/* Pass pendingCart info to register so new users also get the item added */}
          <Link
            to="/register"
            state={pendingCart ? { from: redirectTo, pendingCart: true, productName } : undefined}
            className="reg-link"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;