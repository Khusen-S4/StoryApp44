// scripts/pages/home/home-view.js
import L from "leaflet";

export default class HomeView {
  constructor({ container, customIcon }) {
    this._map = null;  // private field
    this.container = container;
    this.customIcon = customIcon;
    this.markers = [];
  }

  // READ-ONLY ACCESS
  get map() {
    return this._map;
  }

  initMap() {
    if (this._map) return; // safety guard

    this._map = L.map("map").setView([-2.5, 118], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this._map);
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      this._map.removeLayer(marker);
    });
    this.markers = [];
  }

  renderStories(stories) {
    this.container.innerHTML = "";
    this.clearMarkers();

    stories.forEach((story) => {
      const hasLocation = story.lat && story.lon;
      const cardId = `story-${story.lat}-${story.lon}`.replace(/\./g, "_");

      // CARD
      this.container.innerHTML += `
        <div class="story-card" id="${cardId}">
          <img 
            src="${story.photoUrl}"
            class="story-img"
            alt="Foto story oleh ${story.name}: ${story.description}"
            onerror="this.onerror=null; this.src='/images/gambar-error.png'; this.alt='Gambar tidak tersedia';"
          />
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <p><small>${story.createdAt}</small></p>
          <p><small>Lokasi: ${story.lat}, ${story.lon}</small></p>
        </div>
      `;

      // MARKER
      if (hasLocation && this._map) {
        const marker = L.marker([story.lat, story.lon], {
          icon: this.customIcon,
        }).addTo(this._map);

        const popup = `
            <div>
              <strong>${story.name}</strong><br>
              ${story.description}<br>
              <small>${story.lat}, ${story.lon}</small>
              <br><br>
              <button class="popup-scroll-btn" data-target="${cardId}"
                style="
                  padding:4px 8px;
                  border:none;
                  background:#007bff;
                  color:white;
                  border-radius:4px;
                  cursor:pointer;
                ">
                Lihat Story
              </button>
            </div>
        `;

        marker.bindPopup(popup);

        marker.on("popupopen", (e) => {
          const btn = e.popup.getElement().querySelector(".popup-scroll-btn");

          btn?.addEventListener("click", () => {
            const card = document.getElementById(btn.dataset.target);
            card.scrollIntoView({ behavior: "smooth", block: "start" });
            card.style.background = "#fffae6";
            setTimeout(() => (card.style.background = ""), 1500);
          });
        });

        this.markers.push(marker);
      }
    });
  }
}
