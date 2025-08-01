const CACHE_NAME = 'legacyguard-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline.html',
  '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache API responses for offline use
          if (event.request.url.includes('/api/')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for failed uploads
self.addEventListener('sync', event => {
  if (event.tag === 'sync-uploads') {
    event.waitUntil(syncUploads());
  }
});

async function syncUploads() {
  // Get pending uploads from IndexedDB
  const db = await openDB();
  const tx = db.transaction('pending-uploads', 'readonly');
  const store = tx.objectStore('pending-uploads');
  const uploads = await store.getAll();

  for (const upload of uploads) {
    try {
      const response = await fetch(upload.url, {
        method: 'POST',
        body: upload.data,
        headers: upload.headers
      });

      if (response.ok) {
        // Remove from pending uploads
        const deleteTx = db.transaction('pending-uploads', 'readwrite');
        await deleteTx.objectStore('pending-uploads').delete(upload.id);
      }
    } catch (error) {
      console.error('Sync upload failed:', error);
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LegacyGuardDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
