const API = import.meta.env.VITE_API_URL || '/api/tmdb';

// Video Servers Configuration
const VIDEO_SERVERS = [
  { id: 'vidsrc', name: 'VidSrc', embed: 'https://vidsrc.to/embed/{type}/{id}' },
  { id: 'vidsrcme', name: 'VidSrc.me', embed: 'https://vidsrc.me/embed/{type}/{id}' },
  { id: 'vidplay', name: 'VidPlay', embed: 'https://playtube.ws/embed/{type}/{id}' },
  { id: 'streamtape', name: 'StreamTape', embed: 'https://streamtape.com/e/{id}' },
  { id: 'vidguard', name: 'VidGuard', embed: 'https://vidguard.site/embed/{type}/{id}' },
  { id: 'superembed', name: 'SuperEmbed', embed: 'https://superembed.link/{type}/{id}' }
];

// Get preferred server or default to first
let currentServer = localStorage.getItem('zrn_server') || 'vidsrc';
let currentMediaType = 'movie';
let currentMediaId = null;

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
const modalFullscreen = document.getElementById('modalFullscreen');

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

// Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
const pages = document.querySelectorAll('.page');

// Current state
let currentPage = 'home';
let searchTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initMobileSearch();
  initModalClosers();
  initScrollNavbar();
  initFullscreen();
  initLogoScrollTop();
  loadTrending();
  loadPopularKdramas();
  loadTopAnime();
  loadNewReleases();
  buildSourceButtons();
});

// Logo scroll to top
function initLogoScrollTop() {
  const logo = document.getElementById('logo');
  if (!logo) return;
  
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Build source/server buttons
function buildSourceButtons() {
  const sourceRow = document.querySelector('.source-row');
  if (!sourceRow) return;
  
  // Clear existing buttons (keep label)
  const label = sourceRow.querySelector('.source-label');
  sourceRow.innerHTML = '';
  if (label) sourceRow.appendChild(label);
  
  // Create server buttons
  VIDEO_SERVERS.forEach(server => {
    const btn = document.createElement('button');
    btn.className = `source-btn ${server.id === currentServer ? 'active' : ''}`;
    btn.textContent = server.name;
    btn.dataset.server = server.id;
    btn.addEventListener('click', () => switchServer(server.id));
    sourceRow.appendChild(btn);
  });
}

// Switch video server
function switchServer(serverId) {
  currentServer = serverId;
  localStorage.setItem('zrn_server', serverId);
  
  // Update button states
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.server === serverId);
  });
  
  // Reload player if there's content
  if (currentMediaId) {
    loadPlayer(currentMediaId, currentMediaType);
  }
}

// Load player with current server
function loadPlayer(id, type) {
  const server = VIDEO_SERVERS.find(s => s.id === currentServer) || VIDEO_SERVERS[0];
  let embedUrl = server.embed.replace('{id}', id).replace('{type}', type);
  playerFrame.src = embedUrl;
}

// Fullscreen functionality
function initFullscreen() {
  if (!modalFullscreen) return;
  
  modalFullscreen.addEventListener('click', () => {
    const playerWrap = document.querySelector('.player-wrap');
    if (!playerWrap) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (playerWrap.requestFullscreen) {
      playerWrap.requestFullscreen();
    } else if (playerFrame.requestFullscreen) {
      playerFrame.requestFullscreen();
    } else {
      // Fallback for older browsers
      playerFrame.webkitRequestFullscreen?.();
    }
  });
}

// Navbar scroll effect
function initScrollNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Navigation
function initNavigation() {
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchPage(tabName);
    });
  });

  // Mobile navigation
  mobileNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
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

    searchTimeout = setTimeout(() => searchAll(query), 300);
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      searchAll(query);
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      searchResults.style.display = 'none';
    }
  });
}

// Mobile Search
function initMobileSearch() {
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileSearch = document.getElementById('mobileSearch');
  const mobileSearchClose = document.getElementById('mobileSearchClose');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchResults = document.getElementById('mobileSearchResults');

  if (!mobileSearchBtn || !mobileSearch) return;

  // Open mobile search when clicking search button in bottom nav
  mobileSearchBtn.addEventListener('click', () => {
    mobileSearch.classList.add('active');
    mobileSearchInput.focus();
  });

  // Close mobile search
  if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', () => {
      mobileSearch.classList.remove('active');
      mobileSearchInput.value = '';
      mobileSearchResults.innerHTML = '';
    });
  }

  // Close when clicking outside results
  mobileSearch.addEventListener('click', (e) => {
    if (e.target === mobileSearch) {
      mobileSearch.classList.remove('active');
      mobileSearchInput.value = '';
      mobileSearchResults.innerHTML = '';
    }
  });

  // Mobile search input handling
  let mobileSearchTimeout = null;
  mobileSearchInput.addEventListener('input', (e) => {
    clearTimeout(mobileSearchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      mobileSearchResults.innerHTML = '';
      return;
    }

    mobileSearchTimeout = setTimeout(() => mobileSearchAll(query), 300);
  });
}

// Mobile search both movies and TV shows
async function mobileSearchAll(query) {
  const mobileSearchResults = document.getElementById('mobileSearchResults');
  
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${API}/search/movie?query=${encodeURIComponent(query)}`),
      fetch(`${API}/search/tv?query=${encodeURIComponent(query)}`)
    ]);
    
    const movieData = await movieRes.json();
    const tvData = await tvRes.json();
    
    // Combine and sort by popularity
    const results = [
      ...(movieData.results || []).map(m => ({ ...m, media_type: 'movie' })),
      ...(tvData.results || []).map(t => ({ ...t, media_type: 'tv' }))
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    displayMobileSearchResults(results);
  } catch (error) {
    console.error('Mobile search failed:', error);
  }
}

function displayMobileSearchResults(results) {
  const mobileSearchResults = document.getElementById('mobileSearchResults');
  
  if (results.length === 0) {
    mobileSearchResults.innerHTML = '<div class="search-empty" style="text-align: center; padding: 40px; color: var(--text-muted);">No results found</div>';
    return;
  }

  mobileSearchResults.innerHTML = results.slice(0, 10).map(item => {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || '';
    const year = date ? date.split('-')[0] : '';
    const type = item.media_type === 'movie' ? 'Movie' : 'TV Show';
    
    return `
      <div class="search-item" data-id="${item.id}" data-type="${item.media_type}">
        <img class="search-thumb" src="${item.poster_path ? 'https://image.tmdb.org/t/p/w92' + item.poster_path : ''}" alt="${title}">
        <div class="search-info">
          <div class="search-name">${title}</div>
          <div class="search-meta">${year} • ${type}</div>
        </div>
      </div>
    `;
  }).join('');

  // Add click handlers
  mobileSearchResults.querySelectorAll('.search-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const type = item.dataset.type;
      fetchDetail(id, type);
      
      // Close mobile search
      const mobileSearch = document.getElementById('mobileSearch');
      mobileSearch.classList.remove('active');
      document.getElementById('mobileSearchInput').value = '';
      mobileSearchResults.innerHTML = '';
    });
  });
}

// Search both movies and TV shows
async function searchAll(query) {
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${API}/search/movie?query=${encodeURIComponent(query)}`),
      fetch(`${API}/search/tv?query=${encodeURIComponent(query)}`)
    ]);
    
    const movieData = await movieRes.json();
    const tvData = await tvRes.json();
    
    // Combine and sort by popularity
    const results = [
      ...(movieData.results || []).map(m => ({ ...m, media_type: 'movie' })),
      ...(tvData.results || []).map(t => ({ ...t, media_type: 'tv' }))
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    displaySearchResults(results);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

async function searchMovies(query) {
  try {
    const res = await fetch(`${API}/search/movie?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    displaySearchResults((data.results || []).map(m => ({ ...m, media_type: 'movie' })));
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

  searchResults.innerHTML = results.slice(0, 8).map(item => {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || '';
    const year = date ? date.split('-')[0] : '';
    const type = item.media_type === 'movie' ? 'Movie' : 'TV Show';
    
    return `
      <div class="search-item" data-id="${item.id}" data-type="${item.media_type}">
        <img class="search-thumb" src="${item.poster_path ? 'https://image.tmdb.org/t/p/w92' + item.poster_path : ''}" alt="${title}">
        <div class="search-info">
          <div class="search-name">${title}</div>
          <div class="search-meta">${year} • ${type}</div>
        </div>
      </div>
    `;
  }).join('');

  searchResults.style.display = 'block';

  // Add click handlers - FIXED: was '.search-result' but elements use '.search-item'
  searchResults.querySelectorAll('.search-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const type = item.dataset.type;
      fetchDetail(id, type);
      searchResults.style.display = 'none';
      searchInput.value = '';
      
      // Also close mobile search if open
      const mobileSearch = document.getElementById('mobileSearch');
      if (mobileSearch) {
        mobileSearch.classList.remove('active');
      }
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

  // Determine media type for play
  const playType = movie.media_type || (movie.title ? 'movie' : 'tv');
  
  document.getElementById('detailPlay').onclick = () => {
    playMovie(movie.id, movie.title || movie.name, playType);
  };

  document.getElementById('detailWatchlist').onclick = () => {
    addToWatchlist(movie);
  };
}

// Play movie
function playMovie(id, title, type = 'movie') {
  // Close detail modal if open
  detailModal.style.display = 'none';
  
  currentMediaId = id;
  currentMediaType = type;
  modalTitle.textContent = title;
  loadPlayer(id, type);
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
