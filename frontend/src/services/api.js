import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const servicesAPI = {
  getAll: () => api.get('/services/'),
  getById: (id) => api.get(`/services/${id}/`),
  getFeatured: () => api.get('/services/featured/'),
};

export const galleryAPI = {
  getAll: () => api.get('/gallery/'),
  getById: (id) => api.get(`/gallery/${id}/`),
  getFeatured: () => api.get('/gallery/featured/'),
};

export const appointmentsAPI = {
  getAll: () => api.get('/appointments/'),
  create: (data) => api.post('/appointments/', data),
};

export const reviewsAPI = {
  getAll: () => api.get('/reviews/'),
  create: (data) => api.post('/reviews/', data),
};

export const contactAPI = {
  send: (data) => api.post('/contact/', data),
};

export default api;
