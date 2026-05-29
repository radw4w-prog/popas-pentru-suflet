'use client';
// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// NU mai folosim axios.create
// Folosim axios direct cu baseURL setat global
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor response pentru erori
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Eroare API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ✅ Exportăm axios direct - acum AuthContext.defaults funcționează
export default axios;
export { API_URL };

export const versesAPI = {
  getAll: (params) => axios.get('/api/verses', { params }),
  getRandom: (category) => axios.get('/api/verses/random', { params: { category } }),
  getCategories: () => axios.get('/api/verses/categories'),
  getById: (id) => axios.get(`/api/verses/${id}`),
  create: (data) => axios.post('/api/verses', data),
  update: (id, data) => axios.put(`/api/verses/${id}`, data),
  delete: (id) => axios.delete(`/api/verses/${id}`)
};

export const generateAPI = {
  generatePost: (data) => axios.post('/api/generate/post', data),
  generateText: (data) => axios.post('/api/generate/text', data),
  generateImage: (data) => axios.post('/api/generate/image', data),
  generateMultiImage: (data) => axios.post('/api/generate/image/multi', data),
  generateDaily: (data) => axios.post('/api/generate/daily', data),
  getStyles: () => axios.get('/api/generate/styles')
};

export const postsAPI = {
  getAll: (params) => axios.get('/api/posts', { params }),
  getStats: () => axios.get('/api/posts/stats'),
  getById: (id) => axios.get(`/api/posts/${id}`),
  create: (data) => axios.post('/api/posts', data),
  update: (id, data) => axios.put(`/api/posts/${id}`, data),
  delete: (id) => axios.delete(`/api/posts/${id}`),
  publish: (id) => axios.put(`/api/posts/${id}/publish`)
};

export const scheduleAPI = {
  getAll: () => axios.get('/api/schedule'),
  getActive: () => axios.get('/api/schedule/active'),
  getCalendar: (month, year) => axios.get('/api/schedule/calendar', { params: { month, year } }),
  create: (data) => axios.post('/api/schedule', data),
  update: (id, data) => axios.put(`/api/schedule/${id}`, data),
  delete: (id) => axios.delete(`/api/schedule/${id}`)
};

export const socialAPI = {
  getStatus: () => axios.get('/api/social/status'),
  getFacebookInsights: () => axios.get('/api/social/facebook/insights'),
  testPost: (platform, data) => axios.post(`/api/social/test/${platform}`, data)
};

export const settingsAPI = {
  getAll: () => axios.get('/api/settings'),
  get: (key) => axios.get(`/api/settings/${key}`),
  update: (key, data) => axios.put(`/api/settings/${key}`, data),
  init: () => axios.post('/api/settings/init')
};

export const healthAPI = {
  check: () => axios.get('/health')
};