import axios from 'axios';

// Toma la URL del entorno inyectada por Docker o usa localhost por defecto en desarrollo local
const API_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token JWT automáticamente
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;