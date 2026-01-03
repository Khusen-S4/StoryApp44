import HomePage from "../pages/home/home-page.js";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import AddStoryPage from "../pages/tambahstory/addstory.js";
import PageItem from "../pages/item/page-item.js";
import ItemFavorit from "../pages/item/item-favorit";
import ItemFavoritDetail from "../pages/item/item-favorit-detail";

// routes adalah url yang tampil di web
const routes = {
  "/": LoginPage,
  "/home": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add-story": AddStoryPage,
  "/story/:id": PageItem,
  "/favorit": ItemFavorit,
  "/favorit/:id": ItemFavoritDetail,
  
};


export default routes;
