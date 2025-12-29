import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";

class App {
  constructor({ content }) {
    this._content = content;
  }
  

  async renderPage() {
    const url = getActiveRoute(); // Ambil route aktif (#/home, #/login, dll)
    const Page = routes[url];

    if (!Page) {
      this._content.innerHTML = "<h2>404 - Page Not Found</h2>";
      return;
    }

    const page = new Page(); // instance kelas halaman
    this._content.innerHTML = await page.render();
    await page.afterRender();

    // Atur visibilitas drawer button berdasarkan halaman
    this._toggleDrawerVisibility(url);
  }

  _toggleDrawerVisibility(url) {
    const drawerButton = document.getElementById("drawer-button");
    const drawerMenu = document.getElementById("drawer-menu");

    if (!drawerButton || !drawerMenu) return;

    // Sembunyikan tombol drawer di login & register
    if (url === "/login" || url === "/register") {
      drawerButton.classList.add("hidden");
      drawerMenu.classList.add("hidden");
      return;
    }
  }
}

class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const text = this.getAttribute("text") || this.textContent || "© Notes App";
    this.shadowRoot.innerHTML = `
    <style>
      :host{ display:block; }
      .wrap{
        padding: 1.25rem;
        color: white;
        background: var(--accent);
        text-align:center;
        font-weight:700;
        font-size: var(--h3-size);
      }
    </style>
    <footer class="wrap"><slot>© Ahmad Khusen Amin</slot></footer>
  `;
  }
}
customElements.define("app-footer", AppFooter);

export default App;
