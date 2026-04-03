import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000',
  withCredentials: true,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Ajoute le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('feeti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// En cas de 401, nettoie le token local
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('feeti_token');
    }
    return Promise.reject(error);
  }
);

export default api;
