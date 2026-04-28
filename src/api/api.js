import axios from 'axios';

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  'https://mix-loans.onrender.com';

const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');

const API = axios.create({
  baseURL: `${normalizedApiBaseUrl}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mix_loans_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mix_loans_token');
      localStorage.removeItem('mix_loans_admin');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
