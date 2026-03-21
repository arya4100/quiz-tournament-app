import axios from 'axios';

/**
 * GATEWAY: AXIOS API CLIENT
 * 
 * Provides a centralized way to speak to the Spring Boot Backend.
 * Includes a proxy (via vite.config.ts) to handle CORS and 
 * an Interceptor to automatically attach the JWT Security Token.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include JWT token
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

export default api;
