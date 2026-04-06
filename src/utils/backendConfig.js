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

function getConfiguredBackendUrl() {
  try {
    const configured = import.meta?.env?.VITE_BACKEND_URL;
    return configured ? normalizeBaseUrl(configured) : null;
  } catch {
    return null;
  }
}

export function getBackendBaseUrls() {
  const configured = getConfiguredBackendUrl()
    || `http://${getWindowHostname()}:${DEFAULT_BACKEND_PORT}`;

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
