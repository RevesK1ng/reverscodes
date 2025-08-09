const CACHE_NAME = 'reverscodes-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/RCNEWLOLGO.png',
  '/images/astdxlogo.png',
  '/images/successinredeeming.png',
  '/images/how2redeem.png',
  '/images/AnimeRangersXPic.png',
  '/images/animevanguards.png',
  '/images/AriseCrossover.png',
  '/images/Adopt me.png',
  '/images/bloxburg.png',
  '/images/doors.png',
  '/images/towerofhell.png',
  '/images/murdermystery.png',
  '/images/Othergames.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
}); 