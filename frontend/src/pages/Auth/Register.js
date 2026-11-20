import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./Register.css";

import { API } from '../../config';

const Register = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const pendingCart = location.state?.pendingCart;
  const productName = location.state?.productName;
  const redirectTo  = location.state?.from || "/";

  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [form,       setForm]       = useState({ name: "", email: "", phone: "" });
  const [otp,        setOtp]        = useState(["", "", "", "", "", ""]);
  const [resendSecs, setResendSecs] = useState(0);
  const [password,   setPassword]   = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    if (name === "phone") {
      setForm(prev => ({ ...prev, phone: value.replace(/\D/g, "").slice(0, 10) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  /* STEP 1 — Send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const nameRegex  = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!form.name.trim() || !nameRegex.test(form.name.trim()))
      return setError("Full name must contain only letters and spaces.");
    if (!form.email.trim() || !emailRegex.test(form.email.trim()))
      return setError("Enter a valid email address.");
    if (!phoneRegex.test(form.phone))
      return setError("Phone number must be exactly 10 digits.");

    setLoading(true);
    try {
      await axios.post(`${API}/customers/send-register-otp`, {
        name:  form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
      });
      toast.success("OTP sent to your email!", {
        style: { background: "#00044a", color: "#d1a309", fontWeight: 600 },
      });
      setOtp(["", "", "", "", "", ""]);
      setResendSecs(60);
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Try again.";
      if (msg.toLowerCase().includes("already")) {
        setError(
          <span>
            This email is already registered.{" "}
            <Link
              to="/login"
              state={pendingCart ? { from: redirectTo, pendingCart: true, productName } : undefined}
              style={{ color: "#d1a309", fontWeight: "bold", textDecoration: "underline" }}
            >
              Login here
            </Link>
          </span>
        );
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  /* STEP 2 — Verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return setError("Enter the complete 6-digit OTP.");

    setLoading(true);
    try {
      await axios.post(`${API}/customers/verify-register-otp`, {
        email: form.email.trim().toLowerCase(),
        otp:   code,
      });
      toast.success("OTP verified! Set your password.", {
        style: { background: "#00044a", color: "#d1a309", fontWeight: 600 },
      });
      setPassword("");
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendSecs > 0) return;
    setLoading(true);
    try {
      await axios.post(`${API}/customers/resend-register-otp`, {
        email: form.email.trim().toLowerCase(),
      });
      toast.success("New OTP sent!", {
        style: { background: "#00044a", color: "#d1a309", fontWeight: 600 },
      });
      setOtp(["", "", "", "", "", ""]);
      setResendSecs(60);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Try again.");
    }
    setLoading(false);
  };

  /* STEP 3 — Complete Registration */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(password))
      return setError("Password must be exactly 6 numbers.");

    setLoading(true);
    try {
      await axios.post(`${API}/customers/register`, {
        email:    form.email.trim().toLowerCase(),
        password,
      });
      toast.success("Account created! Please login.", {
        duration: 3000,
        style: { background: "#00044a", color: "#d1a309", fontWeight: 600 },
      });
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Registration successful! Please login.",
            from: redirectTo,
            ...(pendingCart ? { pendingCart: true, productName } : {}),
          },
        });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const stepLabels = ["Personal Details", "Verify OTP", "Set Password"];

  return (
    <div className="reg-bg">
      <Toaster position="top-center" />
      <div className="reg-glass-box">
        <h2 className="reg-title">Create Account</h2>
        <p className="reg-subtitle">Step {step} of 3 — {stepLabels[step - 1]}</p>

        {pendingCart && productName && (
          <div style={{
            background: "#fff8e1", border: "1.5px solid #d1a309",
            color: "#7a5c00", borderRadius: 10, padding: "10px 14px",
            marginBottom: 14, fontSize: 13, fontWeight: 500, textAlign: "center",
          }}>
            🛒 Register to add <strong>"{productName}"</strong> to your cart
          </div>
        )}

        <div className="reg-steps">
          {[1, 2, 3].map((n, i) => (
            <React.Fragment key={n}>
              <div className={`reg-step ${step >= n ? "active" : ""}`}>{n}</div>
              {i < 2 && <div className="reg-step-line" />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="reg-error">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input
              name="name" type="text" placeholder="Full Name (letters only) *"
              className="reg-input" value={form.name} onChange={handleChange} required
              onKeyPress={(e) => { if (/[^a-zA-Z\s]/.test(e.key)) e.preventDefault(); }}
            />
            <input
              name="email" type="email" placeholder="Email Address *"
              className="reg-input" value={form.email} onChange={handleChange} required
            />
            <input
              name="phone" type="tel" placeholder="Phone Number (10 digits) *"
              className="reg-input" value={form.phone} onChange={handleChange}
              required maxLength={10}
              onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
            />
            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? "Sending OTP…" : "Send OTP →"}
            </button>
            <p className="reg-footer-text">
              Already have an account?{" "}
              <Link
                to="/login"
                state={pendingCart ? { from: redirectTo, pendingCart: true, productName } : undefined}
                className="reg-link"
              >
                Login here
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="reg-otp-info">
              OTP sent to <strong>{form.email}</strong>.<br />
              Valid for <strong>10 minutes</strong>.
            </div>

            <div className="reg-otp-boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => (otpRefs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={1}
                  className={`reg-otp-box ${digit ? "filled" : ""}`}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            <button className="reg-btn" type="submit" disabled={loading || otp.join("").length < 6}>
              {loading ? "Verifying…" : "Verify OTP ✓"}
            </button>

            <div className="reg-resend-row">
              {resendSecs > 0 ? (
                <span className="reg-resend-timer">Resend OTP in {resendSecs}s</span>
              ) : (
                <button type="button" className="reg-resend-btn" onClick={handleResend} disabled={loading}>
                  Resend OTP
                </button>
              )}
              <button type="button" className="reg-back-link" onClick={() => { setStep(1); setError(""); }}>
                ← Change email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleRegister}>
            <div className="reg-otp-info">
              ✅ Email verified! Set a 6-digit numeric password.
            </div>
            <div className="reg-password-wrap">
              <input
                type="password" placeholder="Password (exactly 6 numbers) *"
                className="reg-input" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                required maxLength={6}
                onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
              />
              {password.length > 0 && (
                <div className={`reg-pwd-strength ${/^\d{6}$/.test(password) ? "strong" : "weak"}`}>
                  {/^\d{6}$/.test(password) ? "✓ Valid 6-digit password" : "Must be exactly 6 numbers"}
                </div>
              )}
            </div>
            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? "Creating Account…" : "Create Account ✓"}
            </button>
            <p className="reg-footer-text">
              Already have an account?{" "}
              <Link
                to="/login"
                state={pendingCart ? { from: redirectTo, pendingCart: true, productName } : undefined}
                className="reg-link"
              >
                Login here
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;