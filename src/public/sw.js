const BASE_PATH = "/StoryApp44/";
const CACHE_NAME = "story-app-v3";

// offline
const APP_SHELL = [
  "/StoryApp44/",
  "/StoryApp44/indexoff.html",
  "/StoryApp44/manifest.json",
  "/StoryApp44/sw.js",
  "/StoryApp44/bundle.js",
  "/StoryApp44/styles/styles.css",
  "/StoryApp44/images/gambar-error.png",
  "/StoryApp44/images/layers-2x.png",
  "/StoryApp44/images/layers.png",
  "/StoryApp44/images/logo.png",
  "/StoryApp44/images/marker-bawah.png",
  "/StoryApp44/images/marker-icon.png",
  "/StoryApp44/images/marker-shadow.png",
  "/StoryApp44/images/st317.png",
];

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
      cache.addAll(APP_SHELL)
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

  // 🔑 HANDLE NAVIGASI (refresh / buka halaman)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(`${BASE_PATH}indexoff.html`)
      )
    );
    return;
  }

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
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});

