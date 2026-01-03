import Api from "../../data/api.js";
import FavoriteStoryDB from "../../data/favorite-story-db.js";


export default class PageItem {
  async render() {
    return `
      <section class="item-detail">
        <p class="loading-text">Memuat detail story...</p>
      </section>
    `;
  }

  async afterRender() {
    const id = this._getIdFromUrl();
    if (!id) return;

    try {
      const story = await Api.getStoryDetail(id);
      this._renderDetail(story);
    } catch (error) {
      document.querySelector(".item-detail").innerHTML = `
        <p class="error-text">❌ Gagal memuat detail story</p>
      `;
    }
  }

  _getIdFromUrl() {
    return window.location.hash.split("/")[2];
  }

  _renderDetail(story) {
    const container = document.querySelector(".item-detail");

    container.innerHTML = `
      <div class="item-detail-wrapper">
        <button class="btn-secondary back-btn" id="back-btn">⬅ Kembali</button>
        <button class="btn-favorit" id="save-btn">⭐ Simpan Story</button>
        <button class="btn-favorit" id="favorit-btn">📌 Lihat Story Favorit</button>

        <article class="item-card">
          <img
            src="${story.photoUrl}"
            alt="Foto story oleh ${story.name}"
            class="item-image"
            onerror="this.onerror=null;this.src='/images/gambar-error.png';"
          />

          <div class="item-content">
            <h2 class="item-title">${story.name}</h2>

            <p class="item-date">
              📅 ${new Date(story.createdAt).toLocaleString("id-ID")}
            </p>

            <p class="item-description">${story.description}</p>

            <div class="item-location">
              📍 Lokasi:
              ${
                story.lat && story.lon
                  ? `${story.lat}, ${story.lon}`
                  : "Tidak tersedia"
              }
            </div>
          </div>
        </article>
      </div>
    `;

    document.getElementById("back-btn").addEventListener("click", () => {
      window.history.back();
    });
    document.getElementById("save-btn").addEventListener("click", async () => {
      await FavoriteStoryDB.addStory(story);
      alert("✅ Story berhasil disimpan ke favorit");
    });
    document.getElementById("favorit-btn").addEventListener("click", () => {
      window.location.hash = "#/favorit";
    });

  }
}
