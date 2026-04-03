import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') + '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30_000,
});

// Ajoute le token JWT à chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('feeti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// En cas de 401, nettoie le token local
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('feeti_token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
