/* =========================
   CONFIG
========================= */
const BASE_PATH = self.location.pathname.includes("StoryApp44")
  ? "/StoryApp44/"
  : "/";

const CACHE_NAME = "story-app-v4";

/* =========================
   APP SHELL (STATIC ONLY)
========================= */
const APP_SHELL = [
  `${BASE_PATH}`,
  `${BASE_PATH}indexoff.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}sw.js`,

  `${BASE_PATH}styles/styles.css`,

  `${BASE_PATH}images/gambar-error.png`,
  `${BASE_PATH}images/layers-2x.png`,
  `${BASE_PATH}images/layers.png`,
  `${BASE_PATH}images/logo.png`,
  `${BASE_PATH}images/marker-bawah.png`,
  `${BASE_PATH}images/marker-icon.png`,
  `${BASE_PATH}images/marker-shadow.png`,
  `${BASE_PATH}images/st317.png`,
];

/* =========================
   PUSH NOTIFICATION
========================= */
self.addEventListener("push", (event) => {
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

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: `${BASE_PATH}icons/icon-192x192.png`,
      badge: `${BASE_PATH}icons/icon-192x192.png`,
    })
  );
});

/* =========================
   MESSAGE FROM CLIENT
========================= */
self.addEventListener("message", (event) => {
  if (event.data?.type !== "NEW_STORY") return;

  const { title, body } = event.data.payload;

  self.registration.showNotification(title, {
    body,
    icon: `${BASE_PATH}icons/icon-192x192.png`,
    badge: `${BASE_PATH}icons/icon-192x192.png`,
  });
});

/* =========================
   INSTALL
========================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of APP_SHELL) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            await cache.put(url, res);
          }
        } catch (err) {
          console.warn("[SW] skip cache:", url);
        }
      }
    })
  );
});

/* =========================
   ACTIVATE
========================= */
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

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // ✅ NAVIGATION (SPA + Offline)
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(`${BASE_PATH}indexoff.html`).then((cached) => {
        return cached || fetch(`${BASE_PATH}`);
      })
    );
    return;
  }


  const url = new URL(event.request.url);

  // ✅ API STORIES (Network → Cache fallback)
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

  // ✅ STATIC ASSETS
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});
