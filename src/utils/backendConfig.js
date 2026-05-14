const DEFAULT_BACKEND_PORT = 8000;

let resolvedBackendBaseUrl = null;

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '');
}

function getWindowHostname() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }

  return 'localhost';
}

// Vite remplace statiquement import.meta.env.VITE_* à la compilation.
// Ne pas utiliser l'optional chaining ici — ça empêche la substitution.
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function getConfiguredBackendUrl() {
  return VITE_BACKEND_URL ? normalizeBaseUrl(VITE_BACKEND_URL) : null;
}

function getDefaultBackendUrl() {
  if (typeof window === 'undefined') {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  if (window.location.protocol === 'https:') {
    // En production HTTPS sans VITE_BACKEND_URL configuré, le fallback sur l'origine
    // frontend enverrait les appels API vers le mauvais serveur. Log d'avertissement.
    console.warn(
      '[backendConfig] VITE_BACKEND_URL non configuré en production. ' +
      'Définissez cette variable dans le dashboard Vercel/hôte. ' +
      'Fallback sur l\'origine courante : ' + window.location.origin
    );
    return window.location.origin;
  }

  return `http://${getWindowHostname()}:${DEFAULT_BACKEND_PORT}`;
}

export function getBackendBaseUrls() {
  const configured = getConfiguredBackendUrl() || getDefaultBackendUrl();

  return [normalizeBaseUrl(configured)];
}

export function rememberBackendBaseUrl(url) {
  resolvedBackendBaseUrl = normalizeBaseUrl(url);
}

export function getPreferredBackendBaseUrl() {
  if (resolvedBackendBaseUrl) {
    return resolvedBackendBaseUrl;
  }

  return getBackendBaseUrls()[0];
}

export async function resolveBackendBaseUrl(forceRefresh = false) {
  if (forceRefresh || !resolvedBackendBaseUrl) {
    resolvedBackendBaseUrl = getPreferredBackendBaseUrl();
  }

  return resolvedBackendBaseUrl;
}

export async function fetchWithBackendFallback(path, init) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = await resolveBackendBaseUrl();
  return fetch(`${baseUrl}${normalizedPath}`, init);
}
