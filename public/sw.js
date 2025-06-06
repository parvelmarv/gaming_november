const CACHE_NAME = 'game-cache-v1';
const VERSION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

// Files to cache
const FILES_TO_CACHE = [
  '/',
  '/game-version.json'
];

// Add timestamp to URLs to prevent caching
const addTimestamp = (url) => {
  const timestamp = new Date().getTime();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${timestamp}`;
};

// Check for updates
const checkForUpdates = async () => {
  try {
    const response = await fetch(addTimestamp('/game-version.json'));
    const data = await response.json();
    const cache = await caches.open(CACHE_NAME);
    const cachedVersion = await cache.match('/game-version.json');
    
    if (cachedVersion) {
      const cachedData = await cachedVersion.json();
      if (cachedData.version !== data.version) {
        console.log('New version detected, clearing cache');
        await caches.delete(CACHE_NAME);
        await cache.addAll(FILES_TO_CACHE);
        // Force reload to get new files
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'RELOAD' });
          });
        });
      }
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
};

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip version check for game-version.json
  if (event.request.url.includes('game-version.json')) {
    event.respondWith(
      fetch(addTimestamp(event.request.url))
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For game files, check cache first, then network
  if (event.request.url.includes('/Build/') || event.request.url.includes('/TemplateData/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            // Check if the cached version is still valid
            return fetch(addTimestamp(event.request.url))
              .then(networkResponse => {
                if (networkResponse.ok) {
                  // Update cache with new version
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });
                  return networkResponse;
                }
                return response;
              })
              .catch(() => response);
          }
          return fetch(addTimestamp(event.request.url))
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
        })
    );
    return;
  }

  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Check for updates periodically
setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 