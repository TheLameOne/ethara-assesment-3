import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Normalise error messages from FastAPI
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') {
      err.message = detail;
    } else if (Array.isArray(detail)) {
      err.message = detail.map((d) => d.msg).join(', ');
    }
    return Promise.reject(err);
  }
);

export default api;
