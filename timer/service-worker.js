const CACHE_NAME = "professional-timer-v1.0.0";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  "./timer-terminer-342934.mp3"
];

// Install SW and cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      // Cache files one by one to handle missing files gracefully
      return Promise.allSettled(
        urlsToCache.map(url => 
          cache.add(url).catch(error => {
            console.warn(`Failed to cache ${url}:`, error);
            return null;
          })
        )
      );
    })
  );
});

// Fetch from cache, then network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Don't cache non-successful responses
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }

        // Clone the response
        const responseToCache = fetchResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache).catch(error => {
            console.warn("Failed to cache response:", error);
          });
        });

        return fetchResponse;
      }).catch(error => {
        console.warn("Fetch failed:", error);
        // Return a fallback response if needed
        return new Response("Offline content not available", {
          status: 503,
          statusText: "Service Unavailable"
        });
      });
    })
  );
});

// Cleanup old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Handle background sync for offline functionality
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any background sync tasks
  console.log("Background sync triggered");
  return Promise.resolve();
}
