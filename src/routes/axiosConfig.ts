import axios from 'axios';
import { getPreferredBackendBaseUrl, resolveBackendBaseUrl } from '../utils/backendConfig';

const api = axios.create({
  baseURL: getPreferredBackendBaseUrl(),
  withCredentials: true,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => Promise.resolve(resolveBackendBaseUrl()).then((baseURL) => {
  config.baseURL = baseURL;
  const token = localStorage.getItem('feeti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('feeti_token');
    }

    return Promise.reject(error);
  }
);

export default api;
