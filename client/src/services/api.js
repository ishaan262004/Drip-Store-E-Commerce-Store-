import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = axios.create({ baseURL: `${API_BASE}/api` });

let tokenProvider = null;

export const registerTokenProvider = (provider) => {
  tokenProvider = provider;
};

// Attach auth token to every request
API.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ───────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ── Products ───────────────────────────────────
export const fetchProducts = (params) => API.get('/products', { params });
export const fetchProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addReview = (id, data) => API.post(`/products/${id}/review`, data);

// ── Orders ─────────────────────────────────────
export const createOrder = (data) => API.post('/orders', data);
export const getUserOrders = (userId) => API.get(`/orders/${userId}`);
export const getAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}`, data);

// ── Coupons ────────────────────────────────────
export const validateCoupon = (data) => API.post('/coupons/validate', data);

// ── Admin ──────────────────────────────────────
export const getAdminUsers = () => API.get('/admin/users');
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminOrders = () => API.get('/admin/orders');
export const getAdminProducts = (params) => API.get('/admin/products', { params });
