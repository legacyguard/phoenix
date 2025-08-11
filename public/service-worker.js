// service-worker.js

const CACHE_VERSION = "v1";
const CACHE_NAMES = {
  STATIC: `legacyguard-static-${CACHE_VERSION}`,
  DYNAMIC: `legacyguard-dynamic-${CACHE_VERSION}`,
  CRITICAL_DATA: `legacyguard-critical-${CACHE_VERSION}`,
  IMAGES: `legacyguard-images-${CACHE_VERSION}`,
};

// Critical paths that should always be available offline
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/shield-icon.svg",
  "/favicon-16x16.svg",
];

// Critical API endpoints to cache for offline access
const CRITICAL_API_PATTERNS = [
  "/api/trusted-people",
  "/api/possessions",
  "/api/documents/list",
  "/api/user/profile",
  "/api/emergency-contacts",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.STATIC)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - implement intelligent caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests with stale-while-revalidate
  if (request.url.includes("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === "image") {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default strategy: cache-first for static assets
  event.respondWith(
    caches
      .match(request)
      .then((response) => response || fetch(request))
      .catch(() => {
        if (request.destination === "document") {
          return caches.match("/offline.html");
        }
      }),
  );
});

// Handle API requests with stale-while-revalidate strategy
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAMES.CRITICAL_DATA);
  const cachedResponse = await cache.match(request);

  // If it's a critical endpoint, return cached data immediately
  const isCritical = CRITICAL_API_PATTERNS.some((pattern) =>
    request.url.includes(pattern),
  );

  if (cachedResponse && isCritical) {
    // Return cached response immediately
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {}); // Fail silently for background update

    return cachedResponse;
  }

  // For non-critical or non-cached, try network first
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAMES.IMAGES);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Return a placeholder image if available
    return caches.match("/placeholder-image.svg");
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAMES.STATIC);
    const cachedResponse = await cache.match(request);
    return cachedResponse || caches.match("/offline.html");
  }
}

// Message handler for cache updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Handle critical data pre-caching
  if (event.data && event.data.type === "CACHE_CRITICAL_DATA") {
    event.waitUntil(cacheCriticalData(event.data.userId));
  }
});

// Pre-cache critical user data
async function cacheCriticalData(userId) {
  if (!userId) return;

  const cache = await caches.open(CACHE_NAMES.CRITICAL_DATA);
  const criticalEndpoints = [
    `/api/trusted-people?userId=${userId}`,
    `/api/possessions?userId=${userId}`,
    `/api/documents/list?userId=${userId}`,
    `/api/emergency-contacts?userId=${userId}`,
  ];

  try {
    const responses = await Promise.all(
      criticalEndpoints.map((endpoint) =>
        fetch(endpoint).then((response) => cache.put(endpoint, response)),
      ),
    );
    console.log("Critical data cached successfully");
  } catch (error) {
    console.error("Error caching critical data:", error);
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-actions") {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // Implement syncing of offline actions
  console.log("Syncing offline actions...");
  // This would sync any queued actions when connectivity is restored
}

// Handle push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    tag: data.tag,
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    timestamp: data.timestamp || Date.now(),
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  // Handle action buttons
  if (action === "update" && data.type === "document_expiry") {
    event.waitUntil(clients.openWindow(data.url || "/documents"));
  } else if (action === "check-now" && data.type === "inactivity_reminder") {
    event.waitUntil(clients.openWindow(data.url || "/dashboard"));
  } else if (action === "remind-later") {
    // Could implement snooze functionality here
    console.log("Reminder snoozed");
  } else {
    // Default action - open the relevant URL
    const urlToOpen = data.url || "/";
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // Check if there's already a window/tab open
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
    );
  }
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  // Track notification dismissals if needed
  console.log("Notification closed:", event.notification.tag);
});
