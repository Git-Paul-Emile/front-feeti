import axios from 'axios';
import { getPreferredBackendBaseUrl, resolveBackendBaseUrl } from '../utils/backendConfig';

const axiosInstance = axios.create({
  baseURL: `${getPreferredBackendBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30_000,
});

// Ajoute le token JWT a chaque requete
axiosInstance.interceptors.request.use((config) => Promise.resolve(resolveBackendBaseUrl()).then((baseURL) => {
  config.baseURL = `${baseURL}/api`;
  const token = localStorage.getItem('feeti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}));

// En cas de 401, nettoie le token local
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('feeti_token');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
