self.addEventListener("push", (event) => {
  console.log("[SW] Push event diterima");

  let data = {
    title: "Story Baru 🎉",
    body: "Ada story baru yang ditambahkan",
  };

  if (event.data) {
    try {
      data = event.data.json(); // 
    } catch (err) {
      data.body = event.data.text(); // 
    }
  }

  console.log("[SW] Data push:", data);

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "NEW_STORY") return;

  const { title, body } = event.data.payload;

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  });
});

const CACHE_NAME = "story-app-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/marker-bawah.png",
  "/images/gambar-error.png",
  "/images/st317.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});





self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // ❌ JANGAN CACHE SELAIN GET
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // API stories (GET saja)
  if (url.origin === "https://story-api.dicoding.dev" &&
      url.pathname.startsWith("/v1/stories")) {

    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          return cache.match(event.request);
        }
      })
    );
    return;
  }

  // static assets
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});




