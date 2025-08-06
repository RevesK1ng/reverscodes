// ===== REVERSCODES HUB - SERVICE WORKER =====
// Provides offline functionality and caching for the ultimate Roblox code portal

const CACHE_NAME = 'reverscodes-hub-v1.1.0';
const STATIC_CACHE = 'reverscodes-static-v1.1.0';
const DYNAMIC_CACHE = 'reverscodes-dynamic-v1.1.0';
const IMAGE_CACHE = 'reverscodes-images-v1.1.0';
const API_CACHE = 'reverscodes-api-v1.1.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/site.webmanifest',
    '/images/RCNEWLOLGO.png',
    '/images/favicon.png',
    '/images/astdxlogo.png',
    '/images/bloxfruits.png',
    '/images/goalbound.png',
    '/images/rivals.png',
    '/images/animeadventures.png',
    '/images/dresstoimpress.png',
    '/images/fruitbattlegrounds.png',
    '/images/shindolife.png',
    '/images/projectslayers.png',
    '/images/kinglegacy.png',
    '/images/animelaststand.png',
    '/images/AnimeRangersX.png',
    '/images/murdermystery2.png',
    '/images/bladeball.png',
    '/images/volleyballlegends.png',
    '/images/combatwarriors.png',
    '/images/jujutsushenanigans.png',
    '/images/projectegoist.png',
    '/images/basketballzero.png',
    '/images/bluelockrivals.png',
    '/images/99nights.png',
    '/images/chatgptbanner.png',
    '/images/fruitwarriors.png',
    '/images/growagarden.png',
    '/images/inkgame.png',
    '/images/sakurastand.png',
    '/images/spongebobtowerdefense.png',
    '/images/stealabrainrot.png',
    '/images/TheHatch.png',
    '/images/towerdefensesimulator.png',
    '/images/robloxupdates.png',
    '/images/rclogobanner.png',
    '/images/Robloxlogo.png',
    '/images/Othergames.png',
    '/images/how2redeem.png',
    '/images/successinredeeming.png',
    '/images/towerofhell.png',
    '/images/doors.png',
    '/images/bloxburg.png',
    '/images/murdermystery.png',
    '/images/animevanguards.png',
    '/images/AriseCrossover.png',
    '/images/Adopt me.png',
    '/images/AnimeRangersXPic.png',
    '/images/astdxlogo.png',
    '/images/favicon.svg.svg',
    '/images/favicon.png',
    '/images/goalbound.png',
    '/images/RCNEWLOLGO.png',
    '/images/rivals.png',
    '/images/successinredeeming.png',
    '/images/towerofhell.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@400;700;900&display=swap'
];

// Critical images for immediate loading
const CRITICAL_IMAGES = [
    '/images/RCNEWLOLGO.png',
    '/images/favicon.png',
    '/images/astdxlogo.png',
    '/images/bloxfruits.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/codes',
    '/api/games',
    '/api/news'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (url.origin === self.location.origin) {
        // Same-origin requests
        event.respondWith(handleSameOriginRequest(request));
    } else if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
        // Google Fonts
        event.respondWith(handleGoogleFontsRequest(request));
    } else {
        // Other external requests
        event.respondWith(handleExternalRequest(request));
    }
});

// Handle same-origin requests
async function handleSameOriginRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Handle Google Fonts requests
async function handleGoogleFontsRequest(request) {
    try {
        // Try cache first for fonts
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return a default font response if available
        return new Response('', {
            status: 404,
            statusText: 'Font not available offline'
        });
    }
}

// Handle external requests
async function handleExternalRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // Return a fallback for images
        if (request.headers.get('accept').includes('image/')) {
            return new Response('', {
                status: 404,
                statusText: 'Image not available offline'
            });
        }
        
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(performBackgroundSync());
    }
});

// Perform background sync
async function performBackgroundSync() {
    try {
        // Sync any pending data when connection is restored
        console.log('Service Worker: Performing background sync');
        
        // You can add specific sync logic here
        // For example, syncing form submissions, analytics data, etc.
        
    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New codes available!',
        icon: '/images/logo.png',
        badge: '/images/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Codes',
                icon: '/images/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/favicon-32x32.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('ReversCodes Hub', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app and navigate to codes section
        event.waitUntil(
            clients.openWindow('/#codes')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled rejection:', event.reason);
}); 