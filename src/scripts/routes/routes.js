import HomePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import AddStoryPage from "../pages/tambahstory/addstory.js";
import PageItem from "../pages/item/page-item.js";

// routes adalah url yang tampil di web
const routes = {
  "/": LoginPage,
  "/home": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add-story": AddStoryPage,
  "/story/:id": PageItem
  // '/home' :HomePage,
  // '/about': new AboutPage(), //ke about boleh hapus
};


export default routes;
