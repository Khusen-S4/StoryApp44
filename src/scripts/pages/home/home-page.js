import HomeView from "./home-view.js";
import HomePresenter from "./home-presenter.js";
import storyMarker from "../../../public/images/marker-bawah.png";
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
            <button class="btn-secondary" id="push-toggle-btn">Subscribe</button>
            <a href="#/add-story" class="btn-primary" id="go-add-story">➕ Tambah Story</a>
            <button class="btn-secondary hidden" id="install-btn">⬇ Install App</button>
            <button class="btn-favorit" id="favorit-btn">Lihat Story Favorit</button>
            
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
    document.getElementById("favorit-btn").addEventListener("click", () => {
      window.location.hash = "#/favorit";
    });
    let deferredPrompt;
    const installBtn = document.getElementById("install-btn");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // simpan state agar tombol muncul walau refresh
      sessionStorage.setItem("pwa-installable", "true");
      installBtn?.classList.remove("hidden");
      console.log("[PWA] beforeinstallprompt fired");
    });


    installBtn?.addEventListener("click", async () => {
      // jika event sudah hilang (karena refresh)
      if (!deferredPrompt) {
        alert("Install belum tersedia. Silakan refresh halaman.");
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("[PWA] Install outcome:", outcome);
      deferredPrompt = null;
      // sembunyikan tombol
      sessionStorage.removeItem("pwa-installable");
      installBtn.classList.add("hidden");
    });
    
    // === LOAD STATE SETELAH REFRESH ===
    if (sessionStorage.getItem("pwa-installable") === "true") {
      installBtn?.classList.remove("hidden");
    }
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed");
      sessionStorage.removeItem("pwa-installable");
      installBtn?.classList.add("hidden");
    });


    
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/StoryApp44/sw.js");
        await navigator.serviceWorker.ready;
        console.log("[SW] Service Worker siap");
      } catch (err) {
        console.error("[SW] Registrasi gagal:", err);
      }
    }
    // =================
    // PRESENTER
    // =================
    const container = document.getElementById("story-list");
    const customStoryIcon = L.icon({
      iconUrl: storyMarker,
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
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return null;
      }
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    }
    async function ensureNotificationPermission() {
      if (!("Notification" in window)) {
        alert("Browser tidak mendukung notifikasi");
        return false;
      }
      if (Notification.permission === "granted") {
        return true;
      }
      if (Notification.permission === "denied") {
        alert(
          "Izin notifikasi ditolak.\nSilakan aktifkan manual di pengaturan browser."
        );
        return false;
      }
      const permission = await Notification.requestPermission();
      return permission === "granted";
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
      const VAPID_PUBLIC_KEY =
        "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      // ✅ UBAH KE FORMAT YANG DIMINTA API
      const subscriptionJSON = subscription.toJSON();
      const response = await fetch(
        "https://story-api.dicoding.dev/v1/notifications/subscribe",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscriptionJSON.endpoint,
            keys: {
              auth: subscriptionJSON.keys.auth,
              p256dh: subscriptionJSON.keys.p256dh,
            },
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Subscribe gagal: ${response.status}`);
      }
      console.log("[PUSH] Subscribe berhasil (201)");
    }




    async function unsubscribePush() {
      if (!("serviceWorker" in navigator)) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;
      //WAJIB: buat ulang subscriptionJSON di sini
      const subscriptionJSON = subscription.toJSON();
      // HAPUS DARI SERVER
      const response = await fetch(
        "https://story-api.dicoding.dev/v1/notifications/subscribe",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscriptionJSON.endpoint,
            keys: {
              auth: subscriptionJSON.keys.auth,
              p256dh: subscriptionJSON.keys.p256dh,
            },
          }),
        }
      );
      if (!response.ok) {
        console.warn("[PUSH] Gagal unsubscribe di server:", response.status);
      }
      // HAPUS DARI BROWSER
      await subscription.unsubscribe();
      console.log("[PUSH] Unsubscribe berhasil");
    }






    async function updatePushButton() {
      if (!pushBtn) return;
      const subscription = await getPushSubscription();
      pushBtn.textContent = subscription ? "Unsubscribe" : "Subscribe";
    }
    await navigator.serviceWorker.ready;
    await updatePushButton();


    pushBtn.addEventListener("click", async () => {
      const subscription = await getPushSubscription();
      if (subscription) {
        await unsubscribePush();
      } else {
        // saya oba WAJIB: pastikan izin dulu
        const allowed = await ensureNotificationPermission();
        if (!allowed) return;
        await subscribePush();
      }
      await updatePushButton();
    });
    
  }
}