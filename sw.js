// Service Worker para Teves
const CACHE_NAME = 'teves-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './mi_icono_192.png',
  './mi_icono_512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // activa el SW nuevo sin esperar a cerrar todas las pestañas/instancias
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // toma control de la app inmediatamente
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(response => response || fetch(req))
  );
});