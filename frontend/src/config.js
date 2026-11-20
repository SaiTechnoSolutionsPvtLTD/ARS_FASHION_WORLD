// ─── Central config — all URLs come from .env ────────────────────────────────
// To change backend URL: edit .env → REACT_APP_API_URL / REACT_APP_IMG_URL
// Never hardcode URLs directly in components.

export const API = process.env.REACT_APP_API_URL || 'http://localhost:7000/api';
export const IMG = process.env.REACT_APP_IMG_URL || 'http://localhost:7000/uploads';
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'ARS Fashion World';
export const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || '';
