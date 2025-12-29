import HomeView from "./home-view.js";
import HomePresenter from "./home-presenter.js";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class HomePage {
  async render() {
    const name = localStorage.getItem("name") || "";

    return `
      <main id="home-main">
        <section class="home-header">
          <h2>Daftar Story ${name ? `<span>"${name}"</span>` : ""}</h2>

          <div class="home-actions">
            <button class="btn-secondary" id="push-toggle-btn">🔔 Subscribe</button>
            <a href="#/add-story" class="btn-primary" id="go-add-story">➕ Tambah Story</a>
            <button id="delete-stories-btn" class="btn-secondary">🗑 Hapus Semua Story</button>
          </div>
        </section>

        <section class="map-wrapper">
          <div id="map"></div>
        </section>

        <section id="story-list" class="story-grid">
          <p class="loading-text">Memuat story...</p>
        </section>
      </main>
    `;
  }

  async afterRender() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("[SW] Service Worker terdaftar:", registration);
      } catch (err) {
        console.error("[SW] Gagal mendaftar Service Worker:", err);
      }
    }
    // =================
    // PRESENTER
    // =================
    const container = document.getElementById("story-list");

    const customStoryIcon = L.icon({
      iconUrl: "/images/marker-bawah.png",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -36],
      shadowUrl: markerShadow,
      shadowSize: [41, 41],
    });

    const homeView = new HomeView({
      container,
      customIcon: customStoryIcon,
    });

    homeView.initMap();

    const presenter = new HomePresenter({
      view: homeView,
    });

    await presenter.init();

    // =================
    // DELETE ALL STORIES
    // =================
    const deleteBtn = document.getElementById("delete-stories-btn");
    deleteBtn?.addEventListener("click", async () => {
      await presenter.deleteAllStories();
      alert("Semua story berhasil dihapus!");
    });

    // =================
    // AUTH CHECK
    // =================
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    // =================
    // UI SETUP
    // =================
    const addStoryLink = document.getElementById("go-add-story");
    const drawerButton = document.getElementById("drawer-button");
    const drawerMenu = document.getElementById("drawer-menu");

    if (drawerButton) drawerButton.style.display = "block";
    if (drawerMenu) drawerMenu.classList.add("hidden");

    addStoryLink?.addEventListener("click", (e) => {
      e.preventDefault();
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = "#/add-story";
        });
      } else {
        window.location.hash = "#/add-story";
      }
    });

    // =================
    // OFFLINE NOTICE
    // =================
    if (!navigator.onLine) {
      container.innerHTML += `<p class="offline-text">⚠️ Anda sedang offline. Data mungkin tidak terbaru.</p>`;
    }
    window.addEventListener("online", () => {
      console.log("Koneksi kembali online");
    });

    window.addEventListener("offline", () => {
      console.log("Anda sedang offline");
      container.innerHTML += `<p class="offline-text">⚠️ Anda sedang offline.</p>`;
    });

    // =================
    // AUTO REFRESH STOP
    // =================
    const onHashChange = () => {
      presenter.stopAutoRefresh();
      window.removeEventListener("hashchange", onHashChange);
    };
    window.addEventListener("hashchange", onHashChange);

    // =================
    // PUSH NOTIFICATION
    // =================
    const pushBtn = document.getElementById("push-toggle-btn");

    async function getPushSubscription() {
      const registration = await navigator.serviceWorker.ready;
      return registration.pushManager.getSubscription();
    }

    async function subscribePush() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Izin notifikasi ditolak");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const { urlBase64ToUint8Array } = await import("../../utils/index.js");

      const VAPID_PUBLIC_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/notifications/subscribe",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        }
      );

      if (!response.ok && response.status !== 400) {
        console.warn("[PUSH] Gagal kirim subscription:", response.status);
      } else {
        console.log("[PUSH] Subscription aktif / sudah terdaftar");
      }
    }

    async function unsubscribePush() {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;
      await subscription.unsubscribe();
      console.log("[PUSH] Unsubscribed");
    }

    async function updatePushButton() {
      const subscription = await getPushSubscription();
      pushBtn.textContent = subscription ? "🔕 Unsubscribe" : "🔔 Subscribe";
    }

    pushBtn.addEventListener("click", async () => {
      const subscription = await getPushSubscription();
      if (subscription) {
        await unsubscribePush();
      } else {
        await subscribePush();
      }
      await updatePushButton();
    });

    await updatePushButton();
  }
}
