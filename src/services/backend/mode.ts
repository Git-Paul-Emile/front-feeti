import type { BackendProviderMode } from "./types";

const STORAGE_KEY = "feeti_backend_provider";
const DEFAULT_MODE: BackendProviderMode = "express";

function isProviderMode(value: string | null | undefined): value is BackendProviderMode {
  return value === "express" || value === "firebase";
}

export function getBackendProviderMode(): BackendProviderMode {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isProviderMode(stored)) return stored;
  }

  const envMode = import.meta.env.VITE_BACKEND_PROVIDER;
  if (isProviderMode(envMode)) return envMode;

  return DEFAULT_MODE;
}

export function setBackendProviderMode(mode: BackendProviderMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}
