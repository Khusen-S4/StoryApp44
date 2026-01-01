import L from "leaflet";

export default class HomeView {
  constructor({ container, customIcon }) {
    this._map = null;
    this.container = container;
    this.customIcon = customIcon;
    this.markers = [];
  }

  // READ-ONLY ACCESS
  get map() {
    return this._map;
  }

  initMap() {
    if (this._map) return;

    this._map = L.map("map").setView([-2.5, 118], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this._map);
  }

  clearMarkers() {
    this.markers.forEach((marker) => this._map.removeLayer(marker));
    this.markers = [];
  }

  // ======================
  // STORY CARD TEMPLATE
  // ======================
  createStoryItem(story) {
    return `
      <article class="story-card story-item" data-id="${story.id}">
        <img
          src="${story.photoUrl}"
          class="story-img"
          alt="Foto story oleh ${story.name}: ${story.description}"
          onerror="this.onerror=null;this.src='/images/gambar-error.png';"
        />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <p><small>${story.createdAt}</small></p>
        <p><small>Lokasi: ${story.lat ?? "-"}, ${story.lon ?? "-"}</small></p>
      </article>
    `;
  }

  // ======================
  // RENDER STORIES + MAP
  // ======================
  renderStories(stories) {
    this.container.innerHTML = "";
    this.clearMarkers();

    stories.forEach((story) => {
      const cardId = `story-${story.id}`;

      // 1️⃣ RENDER CARD
      this.container.insertAdjacentHTML(
        "beforeend",
        this.createStoryItem(story)
      );

      const card = this.container.lastElementChild;
      card.id = cardId;

      // 2️⃣ CARD CLICK → DETAIL PAGE
      card.addEventListener("click", () => {
        window.location.hash = `#/story/${story.id}`;
      });

      // 3️⃣ MAP MARKER
      if (story.lat && story.lon && this._map) {
        const marker = L.marker([story.lat, story.lon], {
          icon: this.customIcon,
        }).addTo(this._map);

        marker.bindPopup(`
          <div>
            <strong>${story.name}</strong><br />
            ${story.description}<br />
            <small>${story.lat}, ${story.lon}</small>
            <br /><br />
            <button class="popup-scroll-btn" data-target="${cardId}">
              Lihat Story
            </button>
          </div>
        `);

        marker.on("popupopen", (e) => {
          const btn = e.popup.getElement().querySelector(".popup-scroll-btn");
          btn?.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            target.style.background = "#fffae6";
            setTimeout(() => (target.style.background = ""), 1500);
          });
        });

        this.markers.push(marker);
      }
    });
  }
}
