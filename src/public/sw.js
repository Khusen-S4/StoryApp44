const BASE_PATH = "/StoryApp44/";
const CACHE_NAME = "story-app-v3";

// ==========================
// PUSH NOTIFICATION
// ==========================
self.addEventListener("push", (event) => {
  console.log("[SW] Push event diterima");

  let data = {
    title: "Story Baru 🎉",
    body: "Ada story baru yang ditambahkan",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: `${BASE_PATH}icons/icon-192x192.png`,
    badge: `${BASE_PATH}icons/icon-192x192.png`,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ==========================
// MESSAGE FROM CLIENT
// ==========================
self.addEventListener("message", (event) => {
  if (event.data?.type !== "NEW_STORY") return;

  const { title, body } = event.data.payload;

  self.registration.showNotification(title, {
    body,
    icon: `${BASE_PATH}icons/icon-192x192.png`,
    badge: `${BASE_PATH}icons/icon-192x192.png`,
  });
});

// ==========================
// INSTALL
// ==========================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        BASE_PATH,
        `${BASE_PATH}index.html`,
        `${BASE_PATH}manifest.json`,
        `${BASE_PATH}images/marker-bawah.png`,
        `${BASE_PATH}images/gambar-error.png`,
        `${BASE_PATH}images/st317.png`,
      ])
    )
  );
  self.skipWaiting();
});

// ==========================
// ACTIVATE
// ==========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ==========================
// FETCH
// ==========================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // API stories (cache-first fallback)
  if (
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/stories")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch {
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
