import axios from "axios";
import { getPreferredBackendBaseUrl, resolveBackendBaseUrl } from "../utils/backendConfig";
import { auth } from "../config/firebase";

const api = axios.create({
  baseURL: getPreferredBackendBaseUrl(),
  withCredentials: true,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Injecte le Firebase ID Token (auto-rafraîchi par le SDK)
api.interceptors.request.use(async (config) => {
  const baseURL = await resolveBackendBaseUrl();
  config.baseURL = baseURL;

  if (auth.currentUser) {
    // getIdToken(false) retourne le token du cache s'il est encore valide,
    // sinon le rafraîchit automatiquement.
    const token = await auth.currentUser.getIdToken(false);
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
