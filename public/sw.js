/* RVC service worker (PWA only — not registered inside the native apps).
   Network-first for pages and RSC payloads, cache-first for hashed build
   assets and images, offline fallback page. VERSION is stamped with the build
   id by scripts/stamp-sw.mjs after `next build`. */
const VERSION = 'rvc-dev';
const SHELL = [
  '/',
  '/photos/',
  '/videos/',
  '/merch/',
  '/events/',
  '/past-shows/',
  '/rsvp/',
  '/membership/',
  '/offline/',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/img/rvc-logo-white.png',
  '/assets/img/rvc-logo-black.png',
  '/assets/img/ye-live-jakarta.jpg',
  '/assets/img/ye-listening-party.jpg',
  '/assets/img/gbk-aerial.jpg',
  '/assets/img/products/tour-tee.svg',
  '/assets/img/products/hoodie.svg',
  '/assets/img/products/longsleeve.svg',
  '/assets/img/products/cap.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (req, res) => {
  if (res.ok) {
    const copy = res.clone();
    caches.open(VERSION).then((c) => c.put(req, copy));
  }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Video byte-range requests (206) can't be stored in the Cache API; let them through.
  if (req.headers.has('range')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => put(req, res))
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline/'))),
    );
    return;
  }

  // Hashed, immutable build output and static images: cache-first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
    return;
  }

  // Everything else (RSC payloads for client navigation, manifest…): network-first.
  e.respondWith(fetch(req).then((res) => put(req, res)).catch(() => caches.match(req)));
});
