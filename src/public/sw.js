self.addEventListener("push", (event) => {
  console.log("[SW] Push event diterima");

  const data = event.data?.json() || {};
  console.log("[SW] Data push:", data);

  const title = data.title || "Story Baru 🎉";
  const options = {
    body: data.body || "Ada story baru yang ditambahkan",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      console.log("[SW] Notifikasi berhasil ditampilkan");
    })
  );
});

// cache
const CACHE_NAME = "story-app-v1";
const STATIC_ASSETS = [
  "/",                     // index.html
  "/index.html",   
  "/images/marker-bawah.png",
  "/images/gambar-error.png",
  "/styles/styles.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("[SW] Gagal cache:", url, err);
          }
        })
      )
    )
  );
  self.skipWaiting();
});



self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/v1/stories")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // fallback: cache-first untuk aset statis
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});


