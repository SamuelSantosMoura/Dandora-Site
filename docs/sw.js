const CACHE_NAME = 'dandora-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/global.css',
  './assets/css/style.css',
  './assets/css/chat.css',
  './assets/images/dandora-icon.jpg',
  './Ficha site/index.html',
  './Ficha site/style.css',
  './Ficha site/app.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Fallback se estiver offline e o recurso não estiver no cache
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
