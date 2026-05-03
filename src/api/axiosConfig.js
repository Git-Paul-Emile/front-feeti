import axios from 'axios';
import { getPreferredBackendBaseUrl, resolveBackendBaseUrl } from '../utils/backendConfig';
import { auth } from '../config/firebase';

const axiosInstance = axios.create({
  baseURL: `${getPreferredBackendBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30_000,
});

// Comme routes/axiosConfig : ID token Firebase en priorité (toujours à jour), puis JWT stocké.
// Attendre authStateReady évite une 1re requête sans user alors que la session Firebase se restaure.
axiosInstance.interceptors.request.use(async (config) => {
  const baseURL = await resolveBackendBaseUrl();
  config.baseURL = `${baseURL}/api`;

  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
  }

  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken(false);
    } catch {
      token = null;
    }
  }
  if (!token) {
    token = localStorage.getItem('accessToken') || localStorage.getItem('feeti_token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('feeti_token');
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
