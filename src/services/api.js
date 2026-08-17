import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('localmarket_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized/Expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('localmarket_token');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwords) => api.put('/auth/password', passwords),
  logout: () => api.post('/auth/logout')
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (storeData) => api.post('/admin/stores', storeData),
  updateStore: (id, storeData) => api.put(`/admin/stores/${id}`, storeData),
  deleteStore: (id) => api.delete(`/admin/stores/${id}`)
};

// Public/Customer Store Services
export const storeService = {
  getStores: (params) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`),
  submitRating: (storeId, rating) => api.post(`/stores/${storeId}/ratings`, { rating })
};

// Store Owner Services
export const ownerService = {
  getDashboard: () => api.get('/owner/dashboard'),
  getReviews: (params) => api.get('/owner/reviews', { params })
};

export default api;
