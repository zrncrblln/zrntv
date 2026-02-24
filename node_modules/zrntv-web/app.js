const API = '/api/tmdb';

// DOM Elements
const trendingRow = document.getElementById('trendingMovies');
const popularKdramasRow = document.getElementById('popularKdramas');
const topAnimeRow = document.getElementById('topAnime');
const newReleasesRow = document.getElementById('newReleases');
const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');
const heroPlay = document.getElementById('heroPlay');
const heroWatchlist = document.getElementById('heroWatchlist');

const detailModal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailOverview = document.getElementById('detailOverview');
const detailPoster = document.getElementById('detailPoster');
const detailBadge = document.getElementById('detailBadge');
const detailMeta = document.getElementById('detailMeta');

const playerModal = document.getElementById('playerModal');
const playerFrame = document.getElementById('playerFrame');
const modalTitle = document.getElementById('modalTitle');

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

// Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const pages = document.querySelectorAll('.page');

// Current state
let currentPage = 'home';
let searchTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initModalClosers();
  loadTrending();
  loadPopularKdramas();
  loadTopAnime();
  loadNewReleases();
});

// Navigation
function initNavigation() {
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchPage(tabName);
    });
  });
}

function switchPage(pageName) {
  // Update tabs
  navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === pageName);
  });

  // Update pages
  pages.forEach(page => {
    page.classList.toggle('active', page.id === `page-${pageName}`);
  });

  currentPage = pageName;
  
  // Load data for the selected page
  if (pageName === 'movies') loadMovies();
  else if (pageName === 'kdrama') loadKDramas();
  else if (pageName === 'anime') loadAnime();
  else if (pageName === 'watchlist') loadWatchlist();
}

// Search
function initSearch() {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    searchTimeout = setTimeout(() => searchMovies(query), 300);
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      searchMovies(query);
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      searchResults.style.display = 'none';
    }
  });
}

async function searchMovies(query) {
  try {
    const res = await fetch(`${API}/search/movie?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    displaySearchResults(data.results || []);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

function displaySearchResults(results) {
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-empty">No results found</div>';
    searchResults.style.display = 'block';
    return;
  }

  searchResults.innerHTML = results.slice(0, 8).map(movie => `
    <div class="search-item" data-id="${movie.id}" data-type="movie">
      <img class="search-thumb" src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w92' + movie.poster_path : ''}" alt="">
      <div class="search-info">
        <div class="search-name">${movie.title}</div>
        <div class="search-meta">${movie.release_date ? movie.release_date.split('-')[0] : ''}</div>
      </div>
    </div>
  `).join('');

  searchResults.style.display = 'block';

  // Add click handlers
  searchResults.querySelectorAll('.search-result').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const type = item.dataset.type;
      fetchDetail(id, type);
      searchResults.style.display = 'none';
      searchInput.value = '';
    });
  });
}

// Modal closers
function initModalClosers() {
  document.getElementById('detailClose').onclick = () => {
    detailModal.style.display = 'none';
  };

  document.getElementById('modalClose').onclick = () => {
    playerFrame.src = '';
    playerModal.style.display = 'none';
  };

  // Close on overlay click
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.style.display = 'none';
    }
  });

  playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) {
      playerFrame.src = '';
      playerModal.style.display = 'none';
    }
  });
}

// Load Trending Movies
async function loadTrending() {
  try {
    const res = await fetch(`${API}/trending/movie/week`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return;

    const hero = data.results[0];
    heroBg.style.backgroundImage = hero.backdrop_path 
      ? `url(https://image.tmdb.org/t/p/original${hero.backdrop_path})`
      : '';
    heroTitle.textContent = hero.title;
    heroDesc.textContent = hero.overview;

    // Hero play button
    heroPlay.onclick = () => playMovie(hero.id, hero.title);

    // Hero watchlist button
    heroWatchlist.onclick = () => addToWatchlist(hero);

    // Render cards
    trendingRow.innerHTML = '';
    data.results.forEach(movie => {
      if (!movie.poster_path) return;
      const card = createMovieCard(movie);
      trendingRow.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load trending:', error);
    heroTitle.textContent = 'Failed to load';
  }
}

// Load Popular K-Dramas
async function loadPopularKdramas() {
  try {
    // Use discover TV with Korean region filter for K-dramas
    const res = await fetch(`${API}/discover/tv?with_origin_states=KR&sort_by=popularity.desc`);
    const data = await res.json();

    renderSection(popularKdramasRow, data.results || []);
  } catch (error) {
    console.error('Failed to load K-Dramas:', error);
  }
}

// Load Top Anime
async function loadTopAnime() {
  try {
    // Use discover TV with anime genre (ID: 16) and animation
    const res = await fetch(`${API}/discover/tv?with_genres=16&sort_by=popularity.desc`);
    const data = await res.json();

    renderSection(topAnimeRow, data.results || []);
  } catch (error) {
    console.error('Failed to load Anime:', error);
  }
}

// Load New Releases
async function loadNewReleases() {
  try {
    const res = await fetch(`${API}/movie/now_playing?language=en-US`);
    const data = await res.json();

    renderSection(newReleasesRow, data.results || []);
  } catch (error) {
    console.error('Failed to load New Releases:', error);
  }
}

// Render section
function renderSection(container, movies) {
  container.innerHTML = '';
  movies.slice(0, 12).forEach(movie => {
    if (!movie.poster_path) return;
    const card = createMovieCard(movie);
    container.appendChild(card);
  });
}

// Create movie card
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img class="card-thumb" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
    <div class="card-overlay">
      <span class="card-title">${movie.title || movie.name}</span>
    </div>
  `;
  card.onclick = () => openDetail(movie);
  return card;
}

// Open detail modal
function openDetail(movie) {
  detailTitle.textContent = movie.title || movie.name;
  detailOverview.textContent = movie.overview || 'No description available.';
  
  if (movie.poster_path) {
    detailPoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }
  
  if (movie.vote_average) {
    detailBadge.textContent = `★ ${movie.vote_average.toFixed(1)}`;
  }
  
  const year = movie.release_date ? movie.release_date.split('-')[0] : 
               movie.first_air_date ? movie.first_air_date.split('-')[0] : '';
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  detailMeta.textContent = `${year} • ${mediaType === 'movie' ? 'Movie' : 'TV Show'}`;

  detailModal.style.display = 'flex';

  document.getElementById('detailPlay').onclick = () => {
    playMovie(movie.id, movie.title || movie.name);
  };

  document.getElementById('detailWatchlist').onclick = () => {
    addToWatchlist(movie);
  };
}

// Play movie
function playMovie(id, title) {
  playerFrame.src = `https://vidsrc.to/embed/movie/${id}`;
  modalTitle.textContent = title;
  playerModal.style.display = 'flex';
}

// Fetch detail by ID (for search results)
async function fetchDetail(id, type) {
  try {
    const endpoint = type === 'movie' ? `movie/${id}` : `tv/${id}`;
    const res = await fetch(`${API}/${endpoint}`);
    const data = await res.json();
    openDetail(data);
  } catch (error) {
    console.error('Failed to fetch detail:', error);
  }
}

// Watchlist
function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem('zrn_watchlist') || '[]');
  
  const exists = watchlist.find(m => m.id === movie.id && (m.media_type === (movie.title ? 'movie' : 'tv')));
  if (exists) {
    showToast('Already in watchlist!');
    return;
  }

  watchlist.push({
    id: movie.id,
    title: movie.title || movie.name,
    poster_path: movie.poster_path,
    media_type: movie.title ? 'movie' : 'tv'
  });

  localStorage.setItem('zrn_watchlist', JSON.stringify(watchlist));
  showToast('Added to watchlist!');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Clear continue watching (placeholder)
function clearContinue() {
  localStorage.removeItem('zrn_continue');
  document.getElementById('continueSection').style.display = 'none';
}

// ============ PAGE DATA LOADERS ============

// Movies Page
let moviesPage = 1;
async function loadMovies(page = 1) {
  try {
    const res = await fetch(`${API}/discover/movie?sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    renderGrid('movieGrid', data.results || [], page > 1);
    moviesPage = page;
  } catch (error) {
    console.error('Failed to load movies:', error);
  }
}

document.getElementById('loadMoreMovies')?.addEventListener('click', () => loadMovies(moviesPage + 1));

// K-Drama Page
let kdramaPage = 1;
async function loadKDramas(page = 1) {
  try {
    const res = await fetch(`${API}/discover/tv?with_origin_country=KR&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    renderGrid('kdramaGrid', data.results || [], page > 1);
    kdramaPage = page;
  } catch (error) {
    console.error('Failed to load K-Dramas:', error);
  }
}

document.getElementById('loadMoreKdrama')?.addEventListener('click', () => loadKDramas(kdramaPage + 1));

// Anime Page
let animePage = 1;
async function loadAnime(page = 1) {
  try {
    const res = await fetch(`${API}/discover/tv?with_genres=16&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    renderGrid('animeGrid', data.results || [], page > 1);
    animePage = page;
  } catch (error) {
    console.error('Failed to load Anime:', error);
  }
}

document.getElementById('loadMoreAnime')?.addEventListener('click', () => loadAnime(animePage + 1));

// Watchlist Page
function loadWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('zrn_watchlist') || '[]');
  const grid = document.getElementById('watchlistGrid');
  const empty = document.getElementById('watchlistEmpty');
  
  if (watchlist.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  renderGrid('watchlistGrid', watchlist, false);
}

// Render grid (for movies/kdrama/anime/watchlist pages)
function renderGrid(containerId, items, append = false) {
  const container = document.getElementById(containerId);
  if (!append) container.innerHTML = '';
  
  items.forEach(item => {
    if (!item.poster_path) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="card-thumb" src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${item.title || item.name}" loading="lazy">
      <div class="card-overlay">
        <span class="card-title">${item.title || item.name}</span>
      </div>
    `;
    card.onclick = () => openDetail(item);
    container.appendChild(card);
  });
}
