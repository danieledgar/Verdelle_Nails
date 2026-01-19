import axios from 'axios';

let apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

if (!apiBaseUrl.endsWith('/api')) {
  apiBaseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
