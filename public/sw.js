const CACHE_NAME = 'game-cache-v1';
const VERSION_CHECK_INTERVAL = 1000 * 60 * 60; // Check for updates every hour

// Files to cache
const urlsToCache = [
  '/',
  '/game-version.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Don't cache API requests
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          // Check for updates in the background
          checkForUpdates();
          return response;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the response for future use
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          });
      })
  );
});

async function checkForUpdates() {
  try {
    const response = await fetch('/game-version.json', { cache: 'no-store' });
    const newVersion = await response.json();
    
    // Get current cached version
    const cachedResponse = await caches.match('/game-version.json');
    const cachedVersion = await cachedResponse.json();

    // If versions don't match, clear cache and reload
    if (newVersion.version !== cachedVersion.version) {
      await caches.delete(CACHE_NAME);
      self.clients.claim();
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'RELOAD' });
        });
      });
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Check for updates periodically
setInterval(checkForUpdates, VERSION_CHECK_INTERVAL); 