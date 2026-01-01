import Api from "../../data/api.js";
import { saveStories, getAllStories, clearStories } from "../../data/db.js";

export default class HomePresenter {
  constructor({ view }) {
    this.view = view;
    this.stories = [];
    this.refreshInterval = null;
    this.lastStoryId = null; // ✅ penanda
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

    // pertama kali load → hanya simpan ID
    if (!this.lastStoryId && stories.length > 0) {
      this.lastStoryId = stories[0].id;
    } 
    // refresh berikutnya → cek perubahan
    else if (stories.length > 0 && stories[0].id !== this.lastStoryId) {
      const newStory = stories[0];
      this.lastStoryId = newStory.id;

      this._notifyNewStory(newStory); // 🔔
    }

    this.stories = stories;
    this.view.renderStories(this.stories);
  }
  async _notifyNewStory(story) {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;

    registration.active?.postMessage({
      type: "NEW_STORY",
      payload: {
        title: "Story Baru 🎉",
        body: `${story.name}: ${story.description}`,
      },
    });
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

}
