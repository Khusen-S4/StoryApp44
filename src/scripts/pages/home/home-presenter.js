import Api from "../../data/api.js";
import { saveStories, getAllStories, clearStories } from "../../data/db.js";

export default class HomePresenter {
  constructor({ view }) {
    this.view = view;
    this.stories = [];
    this.refreshInterval = null;
  }

  async init() {
    await this._loadStories();
    this.startAutoRefresh();
  }

  async fetchStories() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("API gagal");

      const data = await response.json();
      const stories = data?.listStory || [];

      // simpan ke IndexedDB
      await saveStories(stories);
      console.log("[IndexedDB] Stories berhasil disimpan:", stories.length);

      return stories;
    } catch (err) {
      console.warn("API gagal, gunakan cache IndexedDB:", err);
      // ambil dari IndexedDB
      const cachedStories = await getAllStories();
      console.log("[IndexedDB] Stories diambil dari cache:", cachedStories.length);
      return cachedStories || [];
    }
  }

  async _loadStories() {
    const stories = await this.fetchStories();
    this.stories = stories;

    // render langsung semua story
    this.view.renderStories(this.stories);
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(async () => {
      console.log("[AUTO REFRESH] Ambil story terbaru");
      await this._loadStories();
    }, 10000); // 10 detik
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // DELETE ALL STORIES (IndexedDB)
  async deleteAllStories() {
    await clearStories();
    this.stories = [];
    this.view.renderStories([]);
    console.log("[IndexedDB] Semua stories dihapus");
  }
}
