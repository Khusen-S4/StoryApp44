import HomePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import AddStoryPage from "../pages/tambahstory/addstory.js";

const routes = {
  "/": LoginPage,
  "/home": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add-story": AddStoryPage,
  // '/home' :HomePage,
  // '/about': new AboutPage(), //ke about boleh hapus
};

export default routes;
