const BASE_URL = "https://story-api.dicoding.dev/v1";

class Api {
  // Login
  static async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return response.json();
  }

  // Get Stories (token)
  static async getStories() {
    const token = localStorage.getItem("token"); // Ambil token

    const response = await fetch(`${BASE_URL}/stories?location=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json(); // API mengembalikan: {error, listStory}
  }

  // Add Story
  static async addStory(description, photoFile, lat = null, lon = null) {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photoFile);

    if (lat !== null) formData.append("lat", lat);
    if (lon !== null) formData.append("lon", lon);

    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  }
}

export default Api;
