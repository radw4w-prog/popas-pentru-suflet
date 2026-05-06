// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ INTERCEPTOR REQUEST - atașează token la FIECARE cerere
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response - gestionează erori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Eroare API:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };

// === API Versete ===
export const versesAPI = {
  getAll: (params) => api.get('/api/verses', { params }),
  getRandom: (category) => api.get('/api/verses/random', { params: { category } }),
  getCategories: () => api.get('/api/verses/categories'),
  getById: (id) => api.get(`/api/verses/${id}`),
  create: (data) => api.post('/api/verses', data),
  update: (id, data) => api.put(`/api/verses/${id}`, data),
  delete: (id) => api.delete(`/api/verses/${id}`)
};

// === API Generare ===
export const generateAPI = {
  generatePost: (data) => api.post('/api/generate/post', data),
  generateText: (data) => api.post('/api/generate/text', data),
  generateImage: (data) => api.post('/api/generate/image', data),
  generateMultiImage: (data) => api.post('/api/generate/image/multi', data),
  generateDaily: (data) => api.post('/api/generate/daily', data),
  getStyles: () => api.get('/api/generate/styles')
};

// === API Postări ===
export const postsAPI = {
  getAll: (params) => api.get('/api/posts', { params }),
  getStats: () => api.get('/api/posts/stats'),
  getById: (id) => api.get(`/api/posts/${id}`),
  create: (data) => api.post('/api/posts', data),
  update: (id, data) => api.put(`/api/posts/${id}`, data),
  delete: (id) => api.delete(`/api/posts/${id}`),
  publish: (id) => api.put(`/api/posts/${id}/publish`)
};

// === API Programări ===
export const scheduleAPI = {
  getAll: () => api.get('/api/schedule'),
  getActive: () => api.get('/api/schedule/active'),
  getCalendar: (month, year) => api.get('/api/schedule/calendar', { params: { month, year } }),
  create: (data) => api.post('/api/schedule', data),
  update: (id, data) => api.put(`/api/schedule/${id}`, data),
  delete: (id) => api.delete(`/api/schedule/${id}`)
};

// === API Social ===
export const socialAPI = {
  getStatus: () => api.get('/api/social/status'),
  getFacebookInsights: () => api.get('/api/social/facebook/insights'),
  testPost: (platform, data) => api.post(`/api/social/test/${platform}`, data)
};

// === API Setări ===
export const settingsAPI = {
  getAll: () => api.get('/api/settings'),
  get: (key) => api.get(`/api/settings/${key}`),
  update: (key, data) => api.put(`/api/settings/${key}`, data),
  init: () => api.post('/api/settings/init')
};

// === API Health ===
export const healthAPI = {
  check: () => api.get('/health')
};