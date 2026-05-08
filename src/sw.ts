/// <reference lib="WebWorker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  NetworkOnly,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Prend le contrôle de tous les clients immédiatement
self.skipWaiting();
clientsClaim();

// Précache tous les assets Vite (JS, CSS, HTML, fonts, icons)
precacheAndRoute(self.__WB_MANIFEST);

// Supprime les anciens caches à chaque activation
cleanupOutdatedCaches();

// ── Navigation : app shell (SPA) ─────────────────────────────────────────────
// Toutes les navigations qui ne sont pas /api/ ou /admin/ passent par l'index
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'shell-cache',
      networkTimeoutSeconds: 5,
      plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
    {
      denylist: [/^\/api\//, /^\/admin\//],
    }
  )
);

// ── API événements (lecture seule) ───────────────────────────────────────────
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/events') ||
    (url.hostname === 'localhost' && url.port === '8000' && url.pathname.startsWith('/api/events')),
  new StaleWhileRevalidate({
    cacheName: 'events-api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 }),
    ],
  })
);

// ── Paiements / transactions → réseau uniquement, jamais en cache ────────────
registerRoute(
  ({ url }) => /\/(transactions|payments|payouts|wallets)\//.test(url.pathname),
  new NetworkOnly()
);

// ── Images Cloudinary ────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.hostname === 'res.cloudinary.com',
  new CacheFirst({
    cacheName: 'cloudinary-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
);

// ── Google Fonts ─────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);

// ── Fallback offline ─────────────────────────────────────────────────────────
// Si une navigation échoue (hors-ligne), on renvoie /offline.html
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match('/offline.html').then((r) => r ?? Response.error())
    )
  );
});
