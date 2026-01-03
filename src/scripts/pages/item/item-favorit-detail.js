import FavoriteStoryDB from "../../data/favorite-story-db.js";

export default class ItemFavoritDetail {
  async render() {
    return `
      <section class="item-detail">
        <p class="loading-text">Memuat detail story favorit...</p>
      </section>
    `;
  }

  async afterRender() {
    const id = this._getIdFromUrl();
    if (!id) return;

    const story = await FavoriteStoryDB.getStory(id);
    if (!story) {
      document.querySelector(".item-detail").innerHTML = `
        <p class="error-text">❌ Story favorit tidak ditemukan</p>
      `;
      return;
    }

    this._renderDetail(story);
  }

  _getIdFromUrl() {
    return window.location.hash.split("/")[2];
  }

  _renderDetail(story) {
    const container = document.querySelector(".item-detail");

    container.innerHTML = `
      <div class="item-detail-wrapper">
        <button class="btn-secondary back-btn" id="back-btn">⬅ Kembali</button>

        <article class="item-card-favorit-detail">
          <img src="${story.photoUrl}" alt="${story.name}" />

          <div class="item-content-favorit-detail">
            <h2>${story.name}</h2>
            <p>${story.description}</p>
          </div>
        </article>
      </div>
    `;

    document.getElementById("back-btn").addEventListener("click", () => {
      window.history.back();
    });
  }
}
