import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Request interceptor: Attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('createforge_token') ||
      localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Clean error formatting & handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (error.response?.status === 401) {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const requestUrl = error.config?.url || '';

      // Only clear storage if this is a protected API failure and not during active auth endpoints
      if (
        !requestUrl.includes('/auth/login') &&
        !requestUrl.includes('/auth/register') &&
        !pathname.includes('/login') &&
        !pathname.includes('/register') &&
        pathname !== '/'
      ) {
        localStorage.removeItem('createforge_token');
        localStorage.removeItem('createforge_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject({
      ...error,
      customMessage: message,
    });
  }
);

export default api;
