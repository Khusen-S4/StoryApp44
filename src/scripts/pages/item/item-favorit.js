import FavoriteStoryDB from "../../data/favorite-story-db.js";

export default class ItemFavorit {
  async render() {
    return `
      <section class="item-card-favorit">
        <h2>📌 Story Favorit</h2>
        <div id="favorit-list">Memuat...</div>
      </section>
    `;
  }

  async afterRender() {
    const stories = await FavoriteStoryDB.getAllStories();
    const container = document.getElementById("favorit-list");

    if (!stories.length) {
      container.innerHTML = "<p>Belum ada story favorit</p>";
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
        <article class="item-card-favorit story-card" data-id="${story.id}">
          <img src="${story.photoUrl}" alt="${story.name}" />
          <h3>${story.name}</h3>
          <p>${story.description}</p>

          <button class="btn-secondary delete-btn" data-id="${story.id}">
            ❌ Hapus
          </button>
        </article>
      `
      )
      .join("");

    container.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-btn")) {
        await FavoriteStoryDB.deleteStory(e.target.dataset.id);
        this.afterRender();
        return;
      }

      const card = e.target.closest(".story-card");
      if (!card) return;

      window.location.hash = `#/favorit/${card.dataset.id}`;
    });


  }
}
