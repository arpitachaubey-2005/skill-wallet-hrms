import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from sessionStorage if present (backup to http-only cookie)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      (error.message === 'Network Error'
        ? 'Cannot connect to server. Please check your network.'
        : 'An unexpected error occurred. Please try again.');
    error.friendlyMessage = customMessage;
    return Promise.reject(error);
  }
);

export default api;
