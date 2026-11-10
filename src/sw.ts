/// <reference lib="WebWorker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
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

// Anciens caches runtime remplacés (réponses opaques ou données périmées)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all(['cloudinary-images', 'events-api-cache'].map((name) => caches.delete(name)))
  );
});

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

// ── API événements publics (lecture seule) ───────────────────────────────────
// Réseau d'abord : places restantes et statuts doivent toujours être à jour.
// Le cache ne sert qu'en secours hors-ligne. Les routes personnelles
// (favoris, billets, espace organisateur) et les requêtes authentifiées
// ne passent jamais par le cache.
const PRIVATE_EVENT_ROUTES = /\/api\/events\/(favorites|my|organizer|admin)/;
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.pathname.startsWith('/api/events') &&
    !PRIVATE_EVENT_ROUTES.test(url.pathname) &&
    !request.headers.has('Authorization'),
  new NetworkFirst({
    cacheName: 'events-api-v2',
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
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
// Seules les requêtes CORS sont mises en cache : une réponse opaque (balise
// <img> sans crossOrigin) resservie à un canvas ferait disparaître l'affiche
// du billet généré.
registerRoute(
  ({ url, request }) => url.hostname === 'res.cloudinary.com' && request.mode === 'cors',
  new CacheFirst({
    cacheName: 'cloudinary-images-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
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
