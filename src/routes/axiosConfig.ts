import axios from "axios";
import { getPreferredBackendBaseUrl, resolveBackendBaseUrl } from "../utils/backendConfig";
import { auth, authStateReady } from "../services/firebase-auth";

const api = axios.create({
  baseURL: getPreferredBackendBaseUrl(),
  withCredentials: true,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ID token Firebase en priorité (aligné avec api/axiosConfig), puis JWT stocké après authStateReady().
api.interceptors.request.use(async (config) => {
  const baseURL = await resolveBackendBaseUrl();
  config.baseURL = baseURL;

  await authStateReady();

  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken(false);
    } catch {
      token = null;
    }
  }
  if (!token) {
    token = localStorage.getItem("accessToken") || localStorage.getItem("feeti_token");
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// En cas de 401, le token Firebase sera automatiquement rafraîchi à la prochaine requête
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Force le rafraîchissement du token Firebase
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
    }
    return Promise.reject(error);
  }
);

export default api;
