const CACHE_NAME = "projects-static";
const staticAssets = [
  "./",
  "./styles.css",
  "./app.js",
  "/fallback.json",
  "/images/fallback.jpg",
];

self.addEventListener("install", async (event) => {
  const cache = await caches.open(CACHE_NAME);
  cache.addAll(staticAssets);
});

// Delete old cache if cache name is not equal to CACHE_NAME
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      return keys.map(async (cache) => {
        // Remove cache if cache name is not the same as current version
        if (cache !== CACHE_NAME) {
          return await caches.delete(cache);
        }
      });
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.orign === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  // Check if there is a cached response
  const cachedResponse = await caches.match(req);
  // Return cache or fallback on network (aka cache first)
  return cachedResponse || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open("projects-dynamic");

  try {
    // Try accessing network
    const res = await fetch(req);
    cache.put(req, res.clone()).catch((e) => console.log("Error: ", e));
    return res;
  } catch (error) {
    // If it fails, check if we have something in cache and return that instead
    const cachedResponse = await cache.match(req);
    return cachedResponse || caches.match("./fallback.json");
  }
}
