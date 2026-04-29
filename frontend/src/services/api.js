import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;

// Interceptor pentru erori
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Eroare API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// === API Versete ===
export const versesAPI = {
  getAll: (params) => api.get('/verses', { params }),
  getRandom: (category) => api.get('/verses/random', { params: { category } }),
  getCategories: () => api.get('/verses/categories'),
  getById: (id) => api.get(`/verses/${id}`),
  create: (data) => api.post('/verses', data),
  update: (id, data) => api.put(`/verses/${id}`, data),
  delete: (id) => api.delete(`/verses/${id}`)
};

// === API Generare ===
export const generateAPI = {
  generatePost: (data) => api.post('/generate/post', data),
  generateText: (data) => api.post('/generate/text', data),
  generateImage: (data) => api.post('/generate/image', data),
  generateMultiImage: (data) => api.post('/generate/image/multi', data),
  generateDaily: (data) => api.post('/generate/daily', data),
  getStyles: () => api.get('/generate/styles')
};

// === API Postări ===
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getStats: () => api.get('/posts/stats'),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  publish: (id) => api.put(`/posts/${id}/publish`)
};

// === API Programări ===
export const scheduleAPI = {
  getAll: () => api.get('/schedule'),
  getActive: () => api.get('/schedule/active'),
  getCalendar: (month, year) => api.get('/schedule/calendar', { params: { month, year } }),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`)
};

// === API Social ===
export const socialAPI = {
  getStatus: () => api.get('/social/status'),
  getFacebookInsights: () => api.get('/social/facebook/insights'),
  testPost: (platform, data) => api.post(`/social/test/${platform}`, data)
};

// === API Setări ===
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  get: (key) => api.get(`/settings/${key}`),
  update: (key, data) => api.put(`/settings/${key}`, data),
  init: () => api.post('/settings/init')
};

// === API Health ===
export const healthAPI = {
  check: () => api.get('/health')
};

