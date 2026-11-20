import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./Register.css";

import { API } from '../../config';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=enter email, 2=enter OTP, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP countdown timer (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !email.includes("@")) {
      setError("Email must contain @ symbol and be valid!");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/customers/forgot-password`, { email: email.trim().toLowerCase() });
      toast.success(res.data.message || "OTP sent to your email!");
      setStep(2);
      setTimeLeft(600);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Try again.";
      setError(msg);
      // Extra hint for mail config issues
      if (err.response?.status === 500) {
        setError(msg + " (Server mail error — contact support if this persists)");
      }
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP sent to your email.");
      return;
    }
    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/customers/verify-otp`, { email: email.trim().toLowerCase(), otp });
      toast.success(res.data.message || "OTP verified!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    }
    setLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const passwordRegex = /^\d{6}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("New password must be exactly 6 numbers!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/customers/reset-password`, {
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });
      toast.success(res.data.message || "Password updated successfully!");
      setTimeout(() => navigate("/login", { state: { message: "Password reset successful! Please login." } }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Try again.");
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/customers/forgot-password`, { email: email.trim().toLowerCase() });
      toast.success("New OTP sent to your email!");
      setTimeLeft(600);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
    setLoading(false);
  };

  return (
    <div className="reg-bg">
      <Toaster position="top-center" />
      <div className="reg-glass-box">
        <h2 className="reg-title">Forgot Password</h2>

        {/* Step indicators */}
        <div className="reg-steps" style={{ marginBottom: 20 }}>
          <div className={`reg-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="reg-step-line" />
          <div className={`reg-step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className="reg-step-line" />
          <div className={`reg-step ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        <p className="reg-subtitle">
          {step === 1 && "Step 1 — Enter your registered email"}
          {step === 2 && "Step 2 — Enter the OTP sent to your email"}
          {step === 3 && "Step 3 — Set your new password"}
        </p>

        {error && <div className="reg-error">{error}</div>}

        {/* ── Step 1: Email Entry ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Registered Email Address *"
              className="reg-input"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
            />
            <p style={{ fontSize: 12, color: "#999", marginBottom: 12, marginTop: -8 }}>
              Email must contain @ symbol
            </p>
            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 12, textAlign: "center" }}>
              OTP sent to <strong>{email}</strong>
            </p>

            {timeLeft > 0 ? (
              <div style={{
                textAlign: "center", marginBottom: 12, fontSize: 14,
                color: timeLeft < 60 ? "#e53935" : "#2e7d32", fontWeight: 600,
              }}>
                ⏰ OTP expires in: {formatTime(timeLeft)}
              </div>
            ) : (
              <div style={{ textAlign: "center", marginBottom: 12, fontSize: 13, color: "#e53935" }}>
                OTP expired!{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: "none", border: "none", color: "#d1a309", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter 6-digit OTP *"
              className="reg-input"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              maxLength={6}
              required
            />
            <button type="submit" className="reg-btn" disabled={loading || timeLeft <= 0}>
              {loading ? "Verifying..." : "Verify OTP →"}
            </button>
            <button
              type="button"
              className="reg-btn-back"
              style={{ marginTop: 8, width: "100%" }}
              onClick={() => { setStep(1); setError(""); setOtp(""); }}
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New Password (exactly 6 numbers) *"
              className="reg-input"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password *"
              className="reg-input"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              maxLength={6}
              required
            />
            {newPassword.length > 0 && (
              <div style={{
                fontSize: 12,
                color: /^\d{6}$/.test(newPassword) ? "#2e7d32" : "#e53935",
                marginBottom: 8,
                marginTop: -8,
              }}>
                {/^\d{6}$/.test(newPassword) ? "✓ Valid 6-digit password" : "Must be exactly 6 digits"}
              </div>
            )}
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <div style={{ fontSize: 12, color: "#e53935", marginBottom: 8, marginTop: -8 }}>
                ✗ Passwords do not match
              </div>
            )}
            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Password ✓"}
            </button>
          </form>
        )}

        <p className="reg-footer-text" style={{ textAlign: "center", marginTop: 16 }}>
          Remember your password?{" "}
          <Link to="/login" className="reg-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;