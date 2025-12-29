import L from "leaflet";
import "leaflet/dist/leaflet.css";

import customMarker from "../../../public/images/marker-bawah.png";

const customIcon = L.icon({
  iconUrl: customMarker,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export default class AddStoryPage {
  async render() {
    return `
      <h2 class="page-title">Tambah Story Baru</h2>

      <div class="add-story-card">
        <form id="add-story-form" class="add-story-form">

          <!-- Deskripsi -->
          <div class="form-group">
            <label for="story-description">Deskripsi Story</label>
            <textarea
              id="story-description"
              rows="4"
              placeholder="Tulis cerita kamu…"
              required
            ></textarea>
          </div>

          <!-- Foto -->
          <div class="form-group">
            <label for="story-photo">Foto Story</label>
            <input type="file" id="story-photo" accept="image/*" />

            <small>*Ukuran foto maksimal 1 MB</small>
            <small>*Jika lebih dari 1 MB, maka foto akan otomatis dikompres</small>
          </div>

          <!-- Kamera & Preview -->
          <div class="form-group">
            
            <label>Preview Gambar</label>
            <small>*Rasio foto 16:9</small>
            <div class="camera-box">
              <video id="camera-preview" autoplay playsinline></video>
              <img id="photo-preview" alt="Preview foto story" />
            </div>

            <canvas id="camera-canvas" hidden></canvas>

            <label>Ambil Foto dari Kamera</label>
            <div class="camera-actions">
              <button type="button" id="open-camera-btn">📷 Buka Kamera</button>
              <button type="button" id="capture-photo-btn" disabled>📸 Ambil Foto</button>
            </div>

            <small>*Gunakan kamera jika tidak ingin memilih file</small>
          </div>

          <img
            id="photo-preview"
            alt="Preview foto story"
            style="
              display:none;
              width:100%;
              max-height:250px;
              object-fit:cover;
              border-radius:10px;
              margin-top:10px;
            "
          />

          <!-- Lokasi -->
          <h3 class="map-label">Pilih Lokasi di Peta:</h3>
          <div id="map-add"></div>

          <!-- Submit -->
          <button
            id="submit-story-btn"
            type="submit"
            disabled
            class="btn-submit"
          >
            Kirim Story
          </button>
        </form>
      </div>
    `;
  }

  async afterRender() {
    const drawerButton = document.getElementById("drawer-button");
    const drawerMenu = document.getElementById("drawer-menu");

    // Transisi ke home pada submit addstory
    function startTransition(callback) {
      if (document.startViewTransition) {
        document.startViewTransition(callback);
      } else {
        callback();
      }
    }

    if (drawerButton) {
      drawerButton.style.display = "block";
    }

    if (drawerMenu) {
      drawerMenu.classList.add("hidden");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    // Open Camera
    const openCameraBtn = document.getElementById("open-camera-btn");
    const captureBtn = document.getElementById("capture-photo-btn");
    const video = document.getElementById("camera-preview");
    const canvas = document.getElementById("camera-canvas");
    const photoPreview = document.getElementById("photo-preview");

    let cameraStream = null;

    openCameraBtn.addEventListener("click", async () => {
      photoPreview.classList.remove("active");
      video.classList.add("active");
      // video.style.display = "block";
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        video.srcObject = cameraStream;
        video.style.display = "block";

        captureBtn.disabled = false;
      } catch (error) {
        alert("Kamera tidak dapat diakses");
        console.error(error);
      }
    });

    let photoFileFromCamera = null;

    // Capture Button
    captureBtn.addEventListener("click", () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (!videoWidth || !videoHeight) {
        alert("Video belum siap");
        return;
      }

      // Target rasio 16:9
      const targetRatio = 16 / 9;
      const videoRatio = videoWidth / videoHeight;

      let sx, sy, sw, sh;

      if (videoRatio > targetRatio) {
        sh = videoHeight;
        sw = sh * targetRatio;
        sx = (videoWidth - sw) / 2;
        sy = 0;
      } else {
        sw = videoWidth;
        sh = sw / targetRatio;
        sx = 0;
        sy = (videoHeight - sh) / 2;
      }

      const OUTPUT_WIDTH = 1280;
      const OUTPUT_HEIGHT = 720;

      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Gagal mengambil foto");
            return;
          }

          photoFileFromCamera = new File([blob], "camera-photo.jpg", {
            type: "image/jpeg",
          });

          // 🔥 PREVIEW HASIL CAPTURE
          const imageURL = URL.createObjectURL(blob);
          photoPreview.src = imageURL;

          // tampilkan preview, sembunyikan video
          photoPreview.classList.add("active");
          video.classList.remove("active");

          // reset file input
          photoInput.value = "";

          stopCamera();
          updateSubmitButtonState();
        },
        "image/jpeg",
        0.85
      );
    });

    // function stop kamera
    function stopCamera() {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
      }

      video.style.display = "none";
    }

    // ============================
    // 1. INIT PETA
    // ============================
    const map = L.map("map-add").setView([-2.5, 118], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    let marker = null;
    let selectedLat = null;
    let selectedLon = null;

    // Klik peta → buat marker
    map.on("click", (e) => {
      selectedLat = e.latlng.lat;
      selectedLon = e.latlng.lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker([selectedLat, selectedLon], {
        icon: customIcon,
      }).addTo(map);

      updateSubmitButtonState();
    });

    // ============================
    // 2. FORM SUBMIT
    // ============================
    const form = document.getElementById("add-story-form");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 🔒 KUNCI BUTTON (ANTI DOUBLE SUBMIT)
      submitButton.disabled = true;
      submitButton.textContent = "Mengirim...";
      submitButton.style.cursor = "not-allowed";
      submitButton.style.opacity = "0.6";

      const description = document
        .getElementById("story-description")
        .value.trim();

      const fileFromInput = document.getElementById("story-photo").files[0];

      // 🔥 SATU SUMBER FOTO SAJA
      let photoFile = photoFileFromCamera || fileFromInput;

      // ✅ VALIDASI FOTO
      if (!photoFile) {
        alert("Silakan ambil foto dari kamera atau pilih file.");

        resetSubmitButton();
        return;
      }

      // ✅ VALIDASI LOKASI
      if (selectedLat === null || selectedLon === null) {
        alert("Silakan pilih lokasi di peta.");

        resetSubmitButton();
        return;
      }

      // ✅ KOMPRES JIKA > 1MB
      if (photoFile.size > 1_000_000) {
        alert("Foto lebih dari 1MB, sedang dikompres...");
        photoFile = await compressImage(photoFile);
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photoFile);
      formData.append("lat", selectedLat);
      formData.append("lon", selectedLon);

      try {
        const response = await fetch(
          "https://story-api.dicoding.dev/v1/stories",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const result = await response.json();

        if (result.error) {
          alert("Gagal menambah story: " + result.message);
          resetSubmitButton();
          return;
        }

        alert("Story berhasil ditambahkan!");
        startTransition(() => {
          window.location.hash = "#/home";
        });
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan jaringan");
        resetSubmitButton();
      }
    });
    function resetSubmitButton() {
      submitButton.disabled = false;
      submitButton.textContent = "Kirim Story";
      submitButton.style.cursor = "pointer";
      submitButton.style.opacity = "1";
    }

    // ============================
    // 3. FUNGSI KOMPRES FOTO
    // ============================
    async function compressImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const MAX_WIDTH = 1280;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                });
                resolve(compressedFile);
              },
              "image/jpeg",
              0.7
            );
          };
        };
      });
    }

    // ============================
    // 4. VALIDASI ENABLE SUBMIT
    // ============================
    const descriptionInput = document.getElementById("story-description");
    const photoInput = document.getElementById("story-photo");
    const submitButton = document.getElementById("submit-story-btn");

    function updateSubmitButtonState() {
      const hasDescription = descriptionInput.value.trim().length > 0;
      const hasPhoto =
        photoInput.files.length > 0 || photoFileFromCamera !== null;
      const hasLocation = selectedLat !== null && selectedLon !== null;

      if (hasDescription && hasPhoto && hasLocation) {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
        submitButton.style.cursor = "pointer";
      } else {
        submitButton.disabled = true;
        submitButton.style.opacity = "0.5";
        submitButton.style.cursor = "not-allowed";
      }
    }

    descriptionInput.addEventListener("input", updateSubmitButtonState);
    // photoInput.addEventListener("change", updateSubmitButtonState);
    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];

      if (!file) {
        photoPreview.style.display = "none";
        photoPreview.src = "";
        updateSubmitButtonState();
        return;
      }
      // Jika user pilih file, abaikan foto dari kamera
      photoFileFromCamera = null;

      const imageURL = URL.createObjectURL(file);
      photoPreview.src = imageURL;
      photoPreview.style.display = "block";

      updateSubmitButtonState();
    });

    updateSubmitButtonState(); // kunci awal
  }
}
