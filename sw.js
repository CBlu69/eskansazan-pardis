const CACHE = "eskan-v1";

const ASSETS = [
  "/",
  "/style.css",
  "/app.js",
  "/logo.png",
  "/manifest.json",
  "/home.png",
  "/building.png",
  "/task.png",
  "/users.png",
  "/finance.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {

  // HTML همیشه از سرور
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html")
      )
    );
    return;
  }

  // فایل‌های استاتیک از کش
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
