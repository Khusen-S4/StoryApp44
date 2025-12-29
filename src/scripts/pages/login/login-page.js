import Api from "../../data/api.js";

export default class LoginPage {
  async render() {
    return `
      <h2 class="auth-title">Login</h2>

      <div class="auth-card">
        <form id="login-form" class="auth-form">

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
            <p id="emailError" class="error-text"></p>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
            <p id="passwordError" class="error-text"></p>
          </div>

          <button type="submit" class="btn-auth">Login</button>

          <p class="auth-link">
            Belum punya akun?
            <a href="#/register" id="go-register">Daftar di sini</a>
          </p>
        </form>

        <p id="msg" class="error-text center-text"></p>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById("login-form");
    const msg = document.getElementById("msg");
    const submitBtn = form.querySelector('button[type="submit"]');
    const registerLink = document.getElementById("go-register");

    // Transisi ke home pada submit
    function startTransition(callback) {
      if (document.startViewTransition) {
        document.startViewTransition(callback);
      } else {
        callback();
      }
    }

    // Transisi ke Register
    registerLink?.addEventListener("click", (e) => {
      e.preventDefault();

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = "#/register";
        });
      } else {
        window.location.hash = "#/register";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = "Loading...";
      msg.textContent = "";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const result = await Api.login(email, password);

      if (result.error) {
        msg.textContent = result.message;
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
        return;
      }

      localStorage.setItem("token", result.loginResult.token);
      localStorage.setItem("name", result.loginResult.name);

      startTransition(() => {
        window.location.hash = "#/home";
      });
    });
  }
}
