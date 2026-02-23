/* ============================================
   STREAMVAULT — APP.JS
   ============================================ */

// ─── CONFIG ──────────────────────────────────
// Get your FREE API key at: https://www.themoviedb.org/settings/api
const TMDB_KEY = "c138886a68189d4f50a36bd5fe53e588";
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/";

// ─── STATE ───────────────────────────────────
let currentTab = "home";
let heroItems = [];
let heroIndex = 0;
let heroTimer = null;
let currentItem = null;
let currentType = "movie";
let currentSource = "vidsrc";
let moviePage = 1,
  kdramaPage = 1,
  animePage = 1;
let movieGenre = "",
  kdramaGenre = "",
  animeGenre = "";

// ─── INIT ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  checkApiKey();
  setupNav();
  setupSearch();
  setupPlayerModal();
  setupDetailModal();
  loadHome();
  renderContinueWatching();
  scrollNavHandler();
  buildMobileNav();
});

// ─── API KEY CHECK ───────────────────────────
function checkApiKey() {
  if (TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    const banner = document.createElement("div");
    banner.id = "apiBanner";
    banner.style.cssText =
      "position:fixed;top:64px;left:0;right:0;z-index:300;background:#e8b44b;color:#000;text-align:center;padding:10px 16px;font-weight:600;font-size:13px;";
    banner.innerHTML =
      '⚠️ No TMDB API key! Open app.js and replace YOUR_TMDB_API_KEY_HERE with your free key from <a href="https://www.themoviedb.org/settings/api" target="_blank" style="text-decoration:underline">themoviedb.org</a>. Demo mode active.';
    document.body.appendChild(banner);
    loadDemoMode();
    return false;
  }
  return true;
}

// ─── NAV ─────────────────────────────────────
function setupNav() {
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document
    .querySelector(".logo")
    .addEventListener("click", () => switchTab("home"));
}

function switchTab(tab) {
  currentTab = tab;
  document
    .querySelectorAll(".nav-tab")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document
    .querySelectorAll(".mobile-nav-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + tab)?.classList.add("active");
  document.getElementById("heroSection").style.display =
    tab === "home" ? "" : "none";
  const cont = getContinue();
  document.getElementById("continueSection").style.display =
    tab === "home" && cont.length ? "" : "none";
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tab === "movies" && !document.getElementById("movieGrid").children.length)
    loadMoviesPage();
  if (
    tab === "kdrama" &&
    !document.getElementById("kdramaGrid").children.length
  )
    loadKdramaPage();
  if (tab === "anime" && !document.getElementById("animeGrid").children.length)
    loadAnimePage();
  if (tab === "watchlist") renderWatchlist();
}

function scrollNavHandler() {
  window.addEventListener("scroll", () => {
    document
      .getElementById("navbar")
      .classList.toggle("scrolled", window.scrollY > 50);
  });
}

function buildMobileNav() {
  const tabs = [];
  const nav = document.createElement("nav");
  nav.className = "mobile-nav";
  nav.innerHTML = tabs
    .map(
      (t) =>
        `<button class="mobile-nav-btn ${t.tab === "home" ? "active" : ""}" data-tab="${t.tab}">
      <span class="mobile-nav-icon">${t.icon}</span>${t.label}
    </button>`,
    )
    .join("");
  document.body.appendChild(nav);
  nav
    .querySelectorAll(".mobile-nav-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => switchTab(btn.dataset.tab)),
    );
}

// ─── TMDB FETCH ──────────────────────────────
async function tmdb(path, params = {}) {
  const url = new URL(TMDB + path);
  url.searchParams.set("api_key", TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("TMDB " + res.status);
  return res.json();
}

// ─── HOME ────────────────────────────────────
async function loadHome() {
  if (TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return;
  renderSkeletons("trendingMovies");
  renderSkeletons("popularKdramas");
  renderSkeletons("topAnime");
  renderSkeletons("newReleases");
  try {
    const [trending, kdramas, anime, newRel] = await Promise.all([
      tmdb("/trending/movie/week"),
      tmdb("/discover/tv", {
        with_origin_country: "KR",
        sort_by: "popularity.desc",
        language: "en-US",
      }),
      tmdb("/discover/tv", {
        with_genres: "16",
        with_origin_country: "JP",
        sort_by: "popularity.desc",
      }),
      tmdb("/movie/now_playing"),
    ]);
    heroItems = trending.results.slice(0, 6);
    renderHero();
    renderScrollRow("trendingMovies", trending.results.slice(0, 14), "movie");
    renderScrollRow("popularKdramas", kdramas.results.slice(0, 14), "tv");
    renderScrollRow("topAnime", anime.results.slice(0, 14), "tv");
    renderScrollRow("newReleases", newRel.results.slice(0, 14), "movie");
  } catch (e) {
    console.error(e);
    showToast("Failed to load. Check API key.");
  }
}

// ─── HERO ────────────────────────────────────
function renderHero() {
  clearInterval(heroTimer);
  showHeroSlide(0);
  buildHeroDots();
  heroTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroItems.length;
    showHeroSlide(heroIndex);
    updateHeroDots();
  }, 7000);
}

function showHeroSlide(i) {
  heroIndex = i;
  const item = heroItems[i];
  if (!item) return;
  const type = item.title ? "movie" : "tv";
  const backdrop = item.backdrop_path
    ? `${IMG}original${item.backdrop_path}`
    : "";
  document.getElementById("heroBg").style.backgroundImage = backdrop
    ? `url(${backdrop})`
    : "";
  document.getElementById("heroTitle").textContent =
    item.title || item.name || "";
  document.getElementById("heroDesc").textContent = item.overview || "";
  document.getElementById("heroBadge").textContent =
    type === "movie" ? "🎬 TRENDING MOVIE" : "📺 TRENDING SERIES";
  document.getElementById("heroMeta").innerHTML =
    `<span class="hero-rating">★ ${(item.vote_average || 0).toFixed(1)}</span>
     <span>${(item.release_date || item.first_air_date || "").slice(0, 4)}</span>
     <span>${type === "movie" ? "Movie" : "Series"}</span>`;

  const inList = isInWatchlist(item.id);
  const wBtn = document.getElementById("heroWatchlist");
  wBtn.textContent = inList ? "✓ In Watchlist" : "+ Watchlist";
  wBtn.className = inList ? "btn-add in-list" : "btn-add";
  document.getElementById("heroPlay").onclick = () => openPlayer(item, type);
  wBtn.onclick = () => {
    toggleWatchlist(item, type);
    showHeroSlide(heroIndex);
  };
  updateHeroDots();
}

function buildHeroDots() {
  const c = document.getElementById("heroDots");
  c.innerHTML = heroItems
    .map(
      (_, i) =>
        `<div class="hero-dot ${i === 0 ? "active" : ""}" onclick="showHeroSlide(${i})"></div>`,
    )
    .join("");
}

function updateHeroDots() {
  document
    .querySelectorAll(".hero-dot")
    .forEach((d, i) => d.classList.toggle("active", i === heroIndex));
}

// ─── SCROLL ROWS ──────────────────────────────
function renderScrollRow(id, items, type) {
  const row = document.getElementById(id);
  row.innerHTML = "";
  items.forEach((item) => {
    const card = createCard(item, type);
    row.appendChild(card);
  });
}

function renderSkeletons(id, count = 10) {
  const row = document.getElementById(id);
  if (!row) return;
  row.innerHTML = Array(count)
    .fill(0)
    .map(
      () =>
        `<div class="skeleton-card skeleton-card-el">
      <div class="skeleton skeleton-thumb"></div>
      <div class="skeleton skeleton-line" style="margin-top:8px;height:12px;border-radius:99px;"></div>
      <div class="skeleton skeleton-line short" style="margin-top:4px;height:10px;border-radius:99px;width:60%;"></div>
    </div>`,
    )
    .join("");
}

function createCard(item, type) {
  const div = document.createElement("div");
  div.className = "card";
  const title = item.title || item.name || "Unknown";
  const poster = item.poster_path
    ? `${IMG}w300${item.poster_path}`
    : "https://via.placeholder.com/155x232/0f1520/6b7a8d?text=No+Image";
  const rating = (item.vote_average || 0).toFixed(1);
  div.innerHTML = `
    <img class="card-thumb" src="${poster}" alt="${title}" loading="lazy"/>
    <div class="card-overlay">
      <div class="card-play">▶</div>
      <div class="card-title">${title}</div>
      <div class="card-meta-ov">★ ${rating}</div>
    </div>
    <div class="card-info">
      <div class="card-name">${title}</div>
      <div class="card-rating">★ ${rating}</div>
    </div>`;
  div.addEventListener("click", () => openDetail(item, type));
  return div;
}

function createGridCard(item, type) {
  const div = document.createElement("div");
  div.className = "grid-card";
  const title = item.title || item.name || "Unknown";
  const poster = item.poster_path
    ? `${IMG}w300${item.poster_path}`
    : "https://via.placeholder.com/160x240/0f1520/6b7a8d?text=No+Image";
  const rating = (item.vote_average || 0).toFixed(1);
  div.innerHTML = `
    <img class="grid-thumb" src="${poster}" alt="${title}" loading="lazy"/>
    <div class="card-overlay">
      <div class="card-play">▶</div>
      <div class="card-title">${title}</div>
      <div class="card-meta-ov">★ ${rating}</div>
    </div>
    <div class="card-info">
      <div class="card-name">${title}</div>
      <div class="card-rating">★ ${rating}</div>
    </div>`;
  div.addEventListener("click", () => openDetail(item, type));
  return div;
}

// ─── MOVIES PAGE ──────────────────────────────
const MOVIE_GENRES = [
  { id: "", name: "All" },
  { id: "28", name: "Action" },
  { id: "35", name: "Comedy" },
  { id: "18", name: "Drama" },
  { id: "27", name: "Horror" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Sci-Fi" },
  { id: "53", name: "Thriller" },
  { id: "16", name: "Animation" },
  { id: "12", name: "Adventure" },
  { id: "80", name: "Crime" },
];

async function loadMoviesPage() {
  buildGenreFilters("movieGenres", MOVIE_GENRES, (id) => {
    movieGenre = id;
    moviePage = 1;
    document.getElementById("movieGrid").innerHTML = "";
    loadMoviesPage();
  });
  loadMoreMovies(true);
  document.getElementById("loadMoreMovies").onclick = () =>
    loadMoreMovies(false);
}

async function loadMoreMovies(reset) {
  if (reset) {
    moviePage = 1;
    document.getElementById("movieGrid").innerHTML = "";
  }
  try {
    const params = { sort_by: "popularity.desc", page: moviePage };
    if (movieGenre) params.with_genres = movieGenre;
    const data = await tmdb("/discover/movie", params);
    appendGridCards("movieGrid", data.results, "movie");
    moviePage++;
  } catch (e) {
    showToast("Error loading movies");
  }
}

// ─── KDRAMA PAGE ──────────────────────────────
const KDRAMA_GENRES = [
  { id: "", name: "All" },
  { id: "18", name: "Drama" },
  { id: "10749", name: "Romance" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "9648", name: "Mystery" },
  { id: "10765", name: "Fantasy" },
  { id: "10759", name: "Action" },
];

async function loadKdramaPage() {
  buildGenreFilters("kdramaGenres", KDRAMA_GENRES, (id) => {
    kdramaGenre = id;
    kdramaPage = 1;
    document.getElementById("kdramaGrid").innerHTML = "";
    loadKdramaPage();
  });
  loadMoreKdrama(true);
  document.getElementById("loadMoreKdrama").onclick = () =>
    loadMoreKdrama(false);
}

async function loadMoreKdrama(reset) {
  if (reset) {
    kdramaPage = 1;
    document.getElementById("kdramaGrid").innerHTML = "";
  }
  try {
    const params = {
      with_origin_country: "KR",
      sort_by: "popularity.desc",
      page: kdramaPage,
      language: "en-US",
    };
    if (kdramaGenre) params.with_genres = kdramaGenre;
    const data = await tmdb("/discover/tv", params);
    appendGridCards("kdramaGrid", data.results, "tv");
    kdramaPage++;
  } catch (e) {
    showToast("Error loading K-Dramas");
  }
}

// ─── ANIME PAGE ───────────────────────────────
const ANIME_GENRES = [
  { id: "", name: "All" },
  { id: "16", name: "Animation" },
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "14", name: "Fantasy" },
  { id: "878", name: "Sci-Fi" },
  { id: "35", name: "Comedy" },
  { id: "10765", name: "Supernatural" },
];

async function loadAnimePage() {
  buildGenreFilters("animeGenres", ANIME_GENRES, (id) => {
    animeGenre = id;
    animePage = 1;
    document.getElementById("animeGrid").innerHTML = "";
    loadAnimePage();
  });
  loadMoreAnime(true);
  document.getElementById("loadMoreAnime").onclick = () => loadMoreAnime(false);
}

async function loadMoreAnime(reset) {
  if (reset) {
    animePage = 1;
    document.getElementById("animeGrid").innerHTML = "";
  }
  try {
    const params = {
      with_genres: "16",
      with_origin_country: "JP",
      sort_by: "popularity.desc",
      page: animePage,
    };
    if (animeGenre && animeGenre !== "16")
      params.with_genres = "16," + animeGenre;
    const data = await tmdb("/discover/tv", params);
    appendGridCards("animeGrid", data.results, "tv");
    animePage++;
  } catch (e) {
    showToast("Error loading Anime");
  }
}

function appendGridCards(gridId, items, type) {
  const grid = document.getElementById(gridId);
  items.forEach((item) => grid.appendChild(createGridCard(item, type)));
}

function buildGenreFilters(containerId, genres, onSelect) {
  const c = document.getElementById(containerId);
  if (c.children.length) return; // already built
  genres.forEach((g) => {
    const btn = document.createElement("button");
    btn.className = "genre-btn" + (g.id === "" ? " active" : "");
    btn.textContent = g.name;
    btn.addEventListener("click", () => {
      c.querySelectorAll(".genre-btn").forEach((b) =>
        b.classList.remove("active"),
      );
      btn.classList.add("active");
      onSelect(g.id);
    });
    c.appendChild(btn);
  });
}

// ─── SEARCH ───────────────────────────────────
function setupSearch() {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) {
      results.classList.remove("show");
      return;
    }
    timer = setTimeout(() => doSearch(q), 350);
  });
  input.addEventListener("focus", () => {
    if (input.value.trim()) results.classList.add("show");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) results.classList.remove("show");
  });
  document.getElementById("searchBtn").addEventListener("click", () => {
    const q = input.value.trim();
    if (q) doSearch(q);
  });
}

async function doSearch(query) {
  if (TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return;
  const results = document.getElementById("searchResults");
  results.innerHTML =
    '<div style="padding:16px;color:var(--text-muted);font-size:13px;">Searching...</div>';
  results.classList.add("show");
  try {
    const data = await tmdb("/search/multi", { query, include_adult: false });
    const items = data.results
      .filter(
        (r) => r.media_type !== "person" && (r.poster_path || r.backdrop_path),
      )
      .slice(0, 10);
    if (!items.length) {
      results.innerHTML =
        '<div style="padding:16px;color:var(--text-muted);font-size:13px;">No results found</div>';
      return;
    }
    results.innerHTML = items
      .map((item) => {
        const title = item.title || item.name || "";
        const poster = item.poster_path
          ? `${IMG}w92${item.poster_path}`
          : "https://via.placeholder.com/40x56/0f1520/6b7a8d?text=?";
        const year = (item.release_date || item.first_air_date || "").slice(
          0,
          4,
        );
        const type = item.media_type === "movie" ? "Movie" : "TV Series";
        const rating = (item.vote_average || 0).toFixed(1);
        return `<div class="search-item" data-id="${item.id}" data-type="${item.media_type}">
        <img class="search-thumb" src="${poster}" alt="${title}"/>
        <div class="search-info">
          <div class="search-name">${title}</div>
          <div class="search-meta">${type} · ${year} · ★ ${rating}</div>
        </div>
      </div>`;
      })
      .join("");
    results.querySelectorAll(".search-item").forEach((el, i) => {
      el.addEventListener("click", () => {
        results.classList.remove("show");
        document.getElementById("searchInput").value = "";
        openDetail(items[i], items[i].media_type);
      });
    });
  } catch (e) {
    results.innerHTML =
      '<div style="padding:16px;color:var(--text-muted);font-size:13px;">Search failed</div>';
  }
}

// ─── DETAIL MODAL ────────────────────────────
function setupDetailModal() {
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("detailModal")) closeDetail();
  });
}

async function openDetail(item, type) {
  currentItem = item;
  currentType = type;
  const modal = document.getElementById("detailModal");
  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  const title = item.title || item.name || "";
  const poster = item.poster_path
    ? `${IMG}w300${item.poster_path}`
    : "https://via.placeholder.com/140x210/0f1520/6b7a8d?text=No+Image";
  const backdrop = item.backdrop_path ? `${IMG}w780${item.backdrop_path}` : "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const rating = (item.vote_average || 0).toFixed(1);

  document.getElementById("detailBg").style.backgroundImage = backdrop
    ? `url(${backdrop})`
    : "";
  document.getElementById("detailPoster").src = poster;
  document.getElementById("detailTitle").textContent = title;
  document.getElementById("detailBadge").textContent =
    type === "movie" ? "🎬 MOVIE" : type === "tv" ? "📺 SERIES" : "⚡ ANIME";
  document.getElementById("detailMeta").innerHTML =
    `<span class="detail-rating">★ ${rating}</span>
     <span>${year}</span>
     <span>${type === "movie" ? "Movie" : "TV Series"}</span>`;
  document.getElementById("detailOverview").textContent =
    item.overview || "No description available.";

  const inList = isInWatchlist(item.id);
  const wBtn = document.getElementById("detailWatchlist");
  wBtn.textContent = inList ? "✓ In Watchlist" : "+ Watchlist";
  wBtn.className = inList ? "btn-add in-list" : "btn-add";

  document.getElementById("detailPlay").onclick = () => {
    closeDetail();
    openPlayer(item, type);
  };
  wBtn.onclick = () => {
    toggleWatchlist(item, type);
    const updated = isInWatchlist(item.id);
    wBtn.textContent = updated ? "✓ In Watchlist" : "+ Watchlist";
    wBtn.className = updated ? "btn-add in-list" : "btn-add";
  };

  // Load additional details
  if (TMDB_KEY !== "YOUR_TMDB_API_KEY_HERE") {
    try {
      const details = await tmdb(`/${type}/${item.id}`);
      const genres = (details.genres || []).map((g) => g.name).join(", ");
      const runtime =
        type === "movie"
          ? details.runtime
            ? `${details.runtime}m`
            : ""
          : details.number_of_seasons
            ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? "s" : ""}`
            : "";
      document.getElementById("detailMeta").innerHTML =
        `<span class="detail-rating">★ ${rating}</span>
         <span>${year}</span>
         ${runtime ? `<span>${runtime}</span>` : ""}
         ${genres ? `<span>${genres}</span>` : ""}`;
    } catch (e) {}
  }
}

function closeDetail() {
  document.getElementById("detailModal").classList.remove("show");
  document.body.style.overflow = "";
}

// ─── PLAYER MODAL ────────────────────────────
let playerCurrentItem = null;
let playerCurrentType = "movie";
let playerSeason = 1;
let playerEpisode = 1;

function setupPlayerModal() {
  document.getElementById("modalClose").addEventListener("click", closePlayer);
  document.getElementById("playerModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("playerModal")) closePlayer();
  });
  document.querySelectorAll(".src-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".src-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSource = btn.dataset.src;
      loadPlayerFrame();
    });
  });
  document.getElementById("loadEpBtn").addEventListener("click", () => {
    playerSeason = parseInt(document.getElementById("seasonSelect").value);
    playerEpisode = parseInt(document.getElementById("episodeSelect").value);
    loadPlayerFrame();
    saveContinue(
      playerCurrentItem,
      playerCurrentType,
      playerSeason,
      playerEpisode,
    );
  });
  document
    .getElementById("seasonSelect")
    .addEventListener("change", populateEpisodes);
}

async function openPlayer(item, type) {
  playerCurrentItem = item;
  playerCurrentType = type;
  const title = item.title || item.name || "";
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("playerModal").classList.add("show");
  document.body.style.overflow = "hidden";

  const epControls = document.getElementById("epControls");
  if (type === "tv") {
    epControls.style.display = "";
    await populateSeasons(item.id);
    // Check if there's a continue point
    const cont = getContinue().find((c) => c.id === item.id);
    if (cont) {
      playerSeason = cont.season || 1;
      playerEpisode = cont.episode || 1;
      document.getElementById("seasonSelect").value = playerSeason;
      await populateEpisodes();
      document.getElementById("episodeSelect").value = playerEpisode;
    } else {
      playerSeason = 1;
      playerEpisode = 1;
    }
    document.getElementById("modalSub").textContent =
      `S${playerSeason} E${playerEpisode}`;
  } else {
    epControls.style.display = "none";
    playerSeason = 1;
    playerEpisode = 1;
    document.getElementById("modalSub").textContent = "";
  }

  loadPlayerFrame();
  saveContinue(item, type, playerSeason, playerEpisode);
  renderContinueWatching();
}

async function populateSeasons(tvId) {
  const sel = document.getElementById("seasonSelect");
  sel.innerHTML = "<option>Loading...</option>";
  try {
    const data = await tmdb("/tv/" + tvId);
    const seasons = (data.seasons || []).filter((s) => s.season_number > 0);
    sel.innerHTML = seasons
      .map(
        (s) =>
          `<option value="${s.season_number}">Season ${s.season_number}</option>`,
      )
      .join("");
    sel.value = playerSeason <= seasons.length ? playerSeason : 1;
    await populateEpisodes();
  } catch (e) {
    sel.innerHTML = `<option value="1">Season 1</option>`;
    populateEpisodesManual(12);
  }
}

async function populateEpisodes() {
  const tvId = playerCurrentItem?.id;
  const season = parseInt(document.getElementById("seasonSelect").value) || 1;
  const sel = document.getElementById("episodeSelect");
  sel.innerHTML = "<option>Loading...</option>";
  try {
    const data = await tmdb(`/tv/${tvId}/season/${season}`);
    const eps = data.episodes || [];
    sel.innerHTML = eps
      .map(
        (e) =>
          `<option value="${e.episode_number}">Ep ${e.episode_number}: ${e.name}</option>`,
      )
      .join("");
    if (season === playerSeason) sel.value = playerEpisode;
  } catch (e) {
    populateEpisodesManual(12);
  }
}

function populateEpisodesManual(count) {
  const sel = document.getElementById("episodeSelect");
  sel.innerHTML = Array.from(
    { length: count },
    (_, i) => `<option value="${i + 1}">Episode ${i + 1}</option>`,
  ).join("");
}

function loadPlayerFrame() {
  const item = playerCurrentItem;
  if (!item) return;
  const id = item.id;
  const type = playerCurrentType;
  const s = playerSeason,
    ep = playerEpisode;
  let src = "";

  document.getElementById("modalSub").textContent =
    type === "tv" ? `S${s} E${ep}` : "";

  if (currentSource === "vidsrc") {
    if (type === "movie") src = `https://vidsrc.to/embed/movie/${id}`;
    else src = `https://vidsrc.to/embed/tv/${id}/${s}/${ep}`;
  } else if (currentSource === "2embed") {
    if (type === "movie") src = `https://www.2embed.cc/embed/${id}`;
    else src = `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${ep}`;
  } else if (currentSource === "vidsrcme") {
    if (type === "movie") src = `https://vidsrc.me/embed/movie?tmdb=${id}`;
    else
      src = `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${ep}`;
  }

  document.getElementById("playerFrame").src = src;
}

function closePlayer() {
  document.getElementById("playerModal").classList.remove("show");
  document.getElementById("playerFrame").src = "";
  document.body.style.overflow = "";
}

// ─── WATCHLIST ───────────────────────────────
function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem("sv_watchlist") || "[]");
  } catch (e) {
    return [];
  }
}

function saveWatchlist(list) {
  localStorage.setItem("sv_watchlist", JSON.stringify(list));
}

function isInWatchlist(id) {
  return getWatchlist().some((i) => i.id === id);
}

function toggleWatchlist(item, type) {
  let list = getWatchlist();
  const idx = list.findIndex((i) => i.id === item.id);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast("Removed from watchlist");
  } else {
    list.unshift({ ...item, _type: type });
    showToast("Added to watchlist!");
  }
  saveWatchlist(list);
  if (currentTab === "watchlist") renderWatchlist();
}

function renderWatchlist() {
  const list = getWatchlist();
  const grid = document.getElementById("watchlistGrid");
  const empty = document.getElementById("watchlistEmpty");
  grid.innerHTML = "";
  if (!list.length) {
    empty.style.display = "";
    return;
  }
  empty.style.display = "none";
  list.forEach((item) =>
    grid.appendChild(createGridCard(item, item._type || "movie")),
  );
}

// ─── CONTINUE WATCHING ───────────────────────
function getContinue() {
  try {
    return JSON.parse(localStorage.getItem("sv_continue") || "[]");
  } catch (e) {
    return [];
  }
}

function saveContinue(item, type, season, episode) {
  let list = getContinue();
  const idx = list.findIndex((c) => c.id === item.id);
  const entry = { ...item, _type: type, season, episode, _ts: Date.now() };
  if (idx > -1) list.splice(idx, 1);
  list.unshift(entry);
  list = list.slice(0, 20);
  localStorage.setItem("sv_continue", JSON.stringify(list));
}

function clearContinue() {
  localStorage.removeItem("sv_continue");
  renderContinueWatching();
  showToast("Continue watching cleared");
}

function renderContinueWatching() {
  const list = getContinue();
  const sec = document.getElementById("continueSection");
  if (!list.length) {
    sec.style.display = "none";
    return;
  }
  if (currentTab === "home") sec.style.display = "";
  const row = document.getElementById("continueRow");
  row.innerHTML = "";
  list.slice(0, 10).forEach((item) => {
    const div = document.createElement("div");
    div.className = "card";
    const type = item._type || "movie";
    const title = item.title || item.name || "";
    const poster = item.poster_path
      ? `${IMG}w300${item.poster_path}`
      : "https://via.placeholder.com/155x232/0f1520/6b7a8d?text=No+Image";
    const sub =
      type === "tv" ? `S${item.season || 1} E${item.episode || 1}` : "Movie";
    div.innerHTML = `
      <img class="card-thumb" src="${poster}" alt="${title}" loading="lazy"/>
      <div class="card-overlay">
        <div class="card-play">▶</div>
        <div class="card-title">${title}</div>
        <div class="card-meta-ov">${sub}</div>
      </div>
      <div class="card-info">
        <div class="card-name">${title}</div>
        <div class="card-rating">${sub}</div>
        <div class="card-progress-bar"><div class="card-progress-fill" style="width:${Math.random() * 60 + 20}%"></div></div>
      </div>`;
    div.addEventListener("click", () => openPlayer(item, type));
    row.appendChild(div);
  });
}

// ─── TOAST ───────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

// ─── DEMO MODE ───────────────────────────────
function loadDemoMode() {
  const demoItems = [
    {
      id: 1,
      title: "Demo Movie 1",
      vote_average: 8.5,
      release_date: "2024-01-01",
      overview: "This is a demo. Add your TMDB API key to see real content!",
      poster_path: null,
      backdrop_path: null,
    },
    {
      id: 2,
      title: "Demo Movie 2",
      vote_average: 7.2,
      release_date: "2024-03-15",
      overview:
        "Get your free API key at themoviedb.org to unlock thousands of movies, K-dramas, and anime.",
      poster_path: null,
      backdrop_path: null,
    },
    {
      id: 3,
      title: "Demo Movie 3",
      vote_average: 9.0,
      release_date: "2023-11-20",
      overview: "Zrn TV is ready! Just add your API key.",
      poster_path: null,
      backdrop_path: null,
    },
  ];

  heroItems = demoItems;
  document.getElementById("heroTitle").textContent = "Welcome to StreamVault";
  document.getElementById("heroDesc").textContent =
    "Add your free TMDB API key in app.js to start streaming movies, K-Dramas, and Anime!";
  document.getElementById("heroBadge").textContent = "🎬 DEMO MODE";
  document.getElementById("heroMeta").innerHTML =
    '<span style="color:var(--accent)">Get your API key at themoviedb.org</span>';
  buildHeroDots();

  const demoHtml = `<div style="padding:40px 32px;color:var(--text-muted);font-size:14px;line-height:1.8;">
    <strong style="color:var(--text);font-size:18px;">How to activate StreamVault:</strong><br><br>
    1. Go to <a href="https://www.themoviedb.org/signup" target="_blank" style="color:var(--accent)">themoviedb.org</a> and create a free account<br>
    2. Go to Settings → API → Request an API key (free)<br>
    3. Open <code style="background:var(--surface2);padding:2px 6px;border-radius:4px;">app.js</code> and replace <code style="background:var(--surface2);padding:2px 6px;border-radius:4px;">c138886a68189d4f50a36bd5fe53e588</code><br>
    4. Refresh the page — all content loads automatically! 🎉
  </div>`;

  [
    "trendingMovies",
    "popularKdramas",
    "topAnime",
    "newReleases",
    "movieGrid",
    "kdramaGrid",
    "animeGrid",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = demoHtml;
  });
}
