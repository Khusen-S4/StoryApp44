// ===============================
// CSS imports
// ===============================
import "../styles/styles.css";
import App from "./pages/app.js";



// ===============================
// Helper: tunggu elemen
// ===============================
function waitForElement(selector, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    (function check() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      if (Date.now() - start >= timeout) {
        reject(new Error(`Elemen tidak ditemukan: ${selector}`));
        return;
      }

      requestAnimationFrame(check);
    })();
  });
}

// ===============================
// App init
// ===============================
const app = new App({
  content: document.querySelector("#main-content"),
});

// ===============================
// Initial load
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  app.renderPage();
  setupDrawer();
  setupBrandClick();
  
});

// ===============================
// Route change
// ===============================
window.addEventListener("hashchange", () => {
  app.renderPage();
  setupDrawer();
});

// ===============================
// Brand click handler
// ===============================
function setupBrandClick() {
  const brand = document.querySelector(".brand-name");
  if (!brand) return;

  brand.onclick = (e) => {
    e.preventDefault();

    const hash = window.location.hash;

    if (hash === "" || hash === "#/login") {
      alert("Anda di halaman Login.");
      return;
    }

    if (hash === "#/register") {
      alert("Anda di halaman Register.");
      return;
    }

    if (hash === "#/home") {
      waitForElement("#map")
        .then((map) => {
          map.scrollIntoView({ behavior: "smooth", block: "start" });
        })
        .catch(() => {
          alert("Map belum siap ditampilkan.");
        });
      return;
    }

    window.location.hash = "#/home";
  };
}

// ===============================
// Drawer logic (berbasis token)
// ===============================
function setupDrawer() {
  const drawerButton = document.getElementById("drawer-button");
  const drawerMenu = document.getElementById("drawer-menu");
  const logoutButton = document.getElementById("logoutButton");

  if (!drawerButton || !drawerMenu) return;

  const token = localStorage.getItem("token");

  // BELUM LOGIN
  if (!token) {
    drawerButton.classList.add("hidden");
    drawerMenu.classList.add("hidden");
    return;
  }

  // SUDAH LOGIN
  drawerButton.classList.remove("hidden");

  drawerButton.onclick = () => {
    drawerMenu.classList.toggle("hidden");
  };

  if (logoutButton) {
    logoutButton.onclick = () => {
      localStorage.removeItem("token");
      drawerButton.classList.add("hidden");
      drawerMenu.classList.add("hidden");
      window.location.hash = "#/login";
    };
  }
}
