import { tmdb } from "./services/api.js";
import "./pwa.js";
const app = document.getElementById("app");
(async () => {
  const data = await tmdb.trending();
  app.innerHTML = `<h1>ZRN TV</h1>` +
    data.results.slice(0,6).map(i =>
      `<div><img src="https://image.tmdb.org/t/p/w300${i.poster_path}"/><p>${i.title||i.name}</p></div>`
    ).join("");
})();