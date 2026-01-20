import axios from "axios";

/**
 * Base URL resolution
 * - Uses REACT_APP_API_URL in production (Vercel)
 * - Falls back to localhost ONLY for local development
 */
let apiBaseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * Normalize base URL to always end with /api
 */
apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
if (!apiBaseUrl.endsWith("/api")) {
  apiBaseUrl = `${apiBaseUrl}/api`;
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Attach auth token if present
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE interceptor
 * Prevents silent crashes that break entire pages
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Network / CORS error:", error.message);
    }
    return Promise.reject(error);
  }
);

/* ======================
   API MODULES
   ====================== */

export const servicesAPI = {
  getAll: () => api.get("/services/"),
  getById: (id) => api.get(`/services/${id}/`),
  getFeatured: () => api.get("/services/featured/"),
};

export const galleryAPI = {
  getAll: () => api.get("/gallery/"),
  getById: (id) => api.get(`/gallery/${id}/`),
  getFeatured: () => api.get("/gallery/featured/"),
};

export const appointmentsAPI = {
  getAll: () => api.get("/appointments/"),
  create: (data) => api.post("/appointments/", data),
};

export const reviewsAPI = {
  getAll: () => api.get("/reviews/"),
  create: (data) => api.post("/reviews/", data),
};

export const contactAPI = {
  send: (data) => api.post("/contact/", data),
};

export default api;
