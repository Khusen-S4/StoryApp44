export default class RegisterPage {
  async render() {
    return `
      <h2 class="auth-title">Register</h2>

      <div class="auth-card">
        <form id="registerForm" class="auth-form">

          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" type="text" placeholder="Nama lengkap" required>
            <p id="nameError" class="error-text"></p>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="Email" required>
            <p id="emailError" class="error-text"></p>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="Password" required>
            <p id="passwordError" class="error-text"></p>
          </div>

          <button type="submit" class="btn-auth" disabled>
            Register
          </button>
        </form>

        <p class="auth-link">
          Sudah punya akun?
          <a href="#/login" id="go-login">Login di sini</a>
        </p>
      </div>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#registerForm");

    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    const nameError = document.querySelector("#nameError");
    const emailError = document.querySelector("#emailError");
    const passwordError = document.querySelector("#passwordError");

    const submitBtn = form.querySelector('button[type="submit"]');

    const loginLink = document.getElementById("go-login");

    // Transisi ke login pada submit
    function startTransition(callback) {
      if (document.startViewTransition) {
        document.startViewTransition(callback);
      } else {
        callback();
      }
    }

    // Transisi ke login
    loginLink?.addEventListener("click", (e) => {
      e.preventDefault();

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = "#/login";
        });
      } else {
        window.location.hash = "#/login";
      }
    });

    // ===================================================
    // Fungsi untuk kontrol tombol "Register"
    // ===================================================
    function updateSubmitState() {
      const nameValid = nameError.textContent === "";
      const emailValid = emailError.textContent === "";
      const passwordValid = passwordError.textContent === "";

      const nameFilled = nameInput.value.trim() !== "";
      const emailFilled = emailInput.value.trim() !== "";
      const passwordFilled = passwordInput.value.trim() !== "";

      if (
        nameValid &&
        emailValid &&
        passwordValid &&
        nameFilled &&
        emailFilled &&
        passwordFilled
      ) {
        submitBtn.disabled = false;
      } else {
        submitBtn.disabled = true;
      }
    }

    // ===================================================
    // VALIDASI REALTIME NAME
    // ===================================================
    nameInput.addEventListener("input", () => {
      const name = nameInput.value.trim();

      const nameRegex = /^[A-Za-z ]+$/;

      if (name === "") {
        nameError.textContent = "Nama tidak boleh kosong";
      } else if (name.length < 3) {
        nameError.textContent = "Nama minimal 3 karakter";
      } else if (!nameRegex.test(name)) {
        nameError.textContent = "Nama hanya boleh mengandung huruf dan spasi";
      } else {
        nameError.textContent = "";
      }

      updateSubmitState();
    });

    // ===================================================
    // VALIDASI REALTIME EMAIL
    // ===================================================
    emailInput.addEventListener("input", () => {
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email === "") {
        emailError.textContent = "Email tidak boleh kosong";
      } else if (!emailRegex.test(email)) {
        emailError.textContent = "Format email tidak valid";
      } else {
        emailError.textContent = "";
      }

      updateSubmitState();
    });

    // ===================================================
    // VALIDASI REALTIME PASSWORD
    // ===================================================
    passwordInput.addEventListener("input", () => {
      const password = passwordInput.value;

      if (password === "") {
        passwordError.textContent = "Password tidak boleh kosong";
      } else if (password.length < 8) {
        passwordError.textContent = "Password minimal 8 karakter";
      } else {
        passwordError.textContent = "";
      }

      updateSubmitState();
    });

    // ===================================================
    // SUBMIT REGISTER
    // ===================================================
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = "Loading...";

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const result = await response.json();

      if (!result.error) {
        alert("Registrasi berhasil! Silakan login.");
        window.location.hash = "#/login";
      } else {
        alert(result.message);
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
      }
      startTransition(() => {
        window.location.hash = "#/login";
      });
    });
  }
}
