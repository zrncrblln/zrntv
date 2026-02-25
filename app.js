// TMDB API Configuration
// IMPORTANT: For production, move this to a backend server or use environment variables
// This is a temporary solution - API keys should NEVER be exposed in client-side code
const CONFIG = {
  // To use your own API key:
  // 1. Get a free API key from https://www.themoviedb.org/settings/api
  // 2. Replace the value below (or better: use a backend proxy)
  tmdbApiKey: (() => {
    // This obfuscation provides minimal security - use a backend for production!
    const parts = ['c138886a68', '189d4f50', 'a36bd5fe', '53e588'];
    return parts.join('');
  })()
};

// Build the full API URL
// endpoint should include the path and any query params (without api_key)
// e.g., 'trending/movie/week' or 'search/movie?query=term'
const API = (endpoint) => {
  const baseUrl = `https://api.themoviedb.org/3/${endpoint}`;
  const separator = endpoint.includes('&') || endpoint.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}api_key=${CONFIG.tmdbApiKey}`;
};

// Video Servers Configuration
// Updated with more reliable streaming sources
const VIDEO_SERVERS = [
  { id: 'vidsrc', name: 'VidSrc', embed: 'https://vidsrc.to/embed/{type}/{id}' },
  { id: 'vidsrcme', name: 'VidSrc.me', embed: 'https://vidsrc.me/embed/{type}/{id}' },
  { id: 'moviehab', name: 'MovieHab', embed: 'https://embed.moviehab.com/{type}/{id}' },
  { id: 'superembed', name: 'SuperEmbed', embed: 'https://multiembed.mov/?video_id={id}&tmdb=1' },
  { id: 'vidsrcing', name: 'VidSrcIng', embed: 'https://vidsrc.in/embed/{type}/{id}' },
  { id: 'streamtape', name: 'StreamTape', embed: 'https://streamtape.com/e/{id}' }
];

// Build episode URL based on server
function buildEpisodeUrl(server, tvId, season, episode) {
  const s = season.toString().padStart(2, '0');
  const e = episode.toString().padStart(2, '0');
  
  switch(server.id) {
    case 'vidsrc':
      return `https://vidsrc.to/embed/tv/${tvId}/${season}/${episode}`;
    case 'vidsrcme':
      return `https://vidsrc.me/embed/tv/${tvId}-${season}-${episode}`;
    case 'moviehab':
      return `https://embed.moviehab.com/series/tv/${tvId}/${season}/${episode}`;
    case 'vidsrcing':
      return `https://vidsrc.in/embed/tv/${tvId}/${season}/${episode}`;
    case 'streamtape':
      return `https://streamtape.com/e/${tvId}-${season}-${episode}`;
    case 'superembed':
      // SuperEmbed uses TMDB ID directly
      return `https://multiembed.mov/?video_id=${tvId}&tmdb=1&s=${season}&e=${episode}`;
    default:
      return server.embed.replace('{id}', tvId).replace('{type}', 'tv') + `/${season}/${episode}`;
  }
}

// Build movie URL based on server
function buildMovieUrl(server, movieId) {
  switch(server.id) {
    case 'superembed':
      return `https://multiembed.mov/?video_id=${movieId}&tmdb=1`;
    default:
      return server.embed.replace('{id}', movieId).replace('{type}', 'movie');
  }
}

// Genre Constants
const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
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
const modalSub = document.getElementById('modalSub');
const modalFullscreen = document.getElementById('modalFullscreen');

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

// Episode selector elements
const epControls = document.getElementById('epControls');
const seasonSelect = document.getElementById('seasonSelect');
const episodeSelect = document.getElementById('episodeSelect');
const loadEpBtn = document.getElementById('loadEpBtn');

// Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
const pages = document.querySelectorAll('.page');

// Current state
let currentPage = 'home';
let searchTimeout = null;

// TV Show state
let currentTVId = null;
let currentSeason = 1;
let currentEpisode = 1;
let tvSeasonsData = {};
let originalTitle = ''; // Store original title for episode updates

// Genre filter state
let currentMovieGenre = null;
let currentTVGenre = null;

// ============ API CACHE & RETRY SYSTEM ============

const CACHE_DURATION = {
  episodes: 5 * 60 * 1000,  // 5 minutes
  showDetails: 30 * 60 * 1000,  // 30 minutes
  continueWatching: 10 * 60 * 1000  // 10 minutes
};

const apiCache = new Map();

function getCachedData(key) {
  const cached = apiCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.duration) {
    apiCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCacheData(key, data, duration) {
  apiCache.set(key, {
    data: data,
    timestamp: Date.now(),
    duration: duration
  });
}

async function fetchWithRetry(endpoint, options = {}) {
  const {
    retries = 3,
    retryDelay = 1000,
    cacheKey = null,
    cacheDuration = 0,
    showError = true
  } = options;
  
  if (cacheKey) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(API(endpoint));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (cacheKey && cacheDuration > 0) {
        setCacheData(cacheKey, data, cacheDuration);
      }
      
      return data;
      
    } catch (error) {
      lastError = error;
      console.warn(`Fetch attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  if (showError) {
    showToast(`Failed to load: ${lastError?.message || 'Unknown error'}`, 'error');
  }
  
  throw lastError;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initMobileSearch();
  initModalClosers();
  initScrollNavbar();
  initFullscreen();
  initLogoScrollTop();
  initEpisodeSelector();
  initKeyboardShortcuts();
  initGenreFilters();
  loadTrending();
  loadPopularKdramas();
  loadTopAnime();
  loadNewReleases();
  buildSourceButtons();
  initScrollToTop();
  displayContinueWatching();
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
  let embedUrl;
  
  if (type === 'movie') {
    embedUrl = buildMovieUrl(server, id);
  } else {
    // For TV shows, use the episode URL with default season/episode
    embedUrl = buildEpisodeUrl(server, id, 1, 1);
  }
  
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
  
  // Listen for fullscreen changes to handle pointer-events
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
}

// Handle fullscreen change events
function handleFullscreenChange() {
  const playerWrap = document.querySelector('.player-wrap');
  const playerModalEl = document.getElementById('playerModal');
  
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    // Entered fullscreen - ensure pointer events work properly
    console.log('Entered fullscreen mode');
    
    // Add class for CSS targeting
    playerWrap?.classList.add('is-fullscreen');
    playerModalEl?.classList.add('is-fullscreen');
    
    // Ensure iframe can receive pointer events for video controls
    if (playerFrame) {
      playerFrame.style.pointerEvents = 'auto';
    }
  } else {
    // Exited fullscreen - restore normal behavior
    console.log('Exited fullscreen mode');
    
    // Remove fullscreen classes
    playerWrap?.classList.remove('is-fullscreen');
    playerModalEl?.classList.remove('is-fullscreen');
    
    // Ensure pointer events are properly restored
    if (playerFrame) {
      playerFrame.style.pointerEvents = 'auto';
    }
  }
}

// Force release pointer events if stuck in fullscreen
function forceReleaseFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (document.webkitFullscreenElement) {
    document.webkitExitFullscreen?.().catch(() => {});
  }
  
  // Reset pointer events on iframe
  if (playerFrame) {
    playerFrame.style.pointerEvents = 'auto';
  }
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

  // Update mobile nav buttons
  mobileNavBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === pageName);
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

// Genre Filters
function initGenreFilters() {
  // Movie genres
  const movieGenresContainer = document.getElementById('movieGenres');
  if (movieGenresContainer) {
    // Add "All" button
    let movieHtml = '<button class="genre-btn active" data-genre="all">All</button>';
    movieHtml += MOVIE_GENRES.slice(0, 8).map(g => 
      `<button class="genre-btn" data-genre="${g.id}">${g.name}</button>`
    ).join('');
    movieGenresContainer.innerHTML = movieHtml;
    
    movieGenresContainer.querySelectorAll('.genre-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        movieGenresContainer.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const genreId = btn.dataset.genre === 'all' ? null : parseInt(btn.dataset.genre);
        currentMovieGenre = genreId;
        loadMovies(1, genreId);
      });
    });
  }
  
  // K-Drama genres
  const kdramaGenresContainer = document.getElementById('kdramaGenres');
  if (kdramaGenresContainer) {
    let kdramaHtml = '<button class="genre-btn active" data-genre="all">All</button>';
    kdramaHtml += TV_GENRES.slice(0, 8).map(g => 
      `<button class="genre-btn" data-genre="${g.id}">${g.name}</button>`
    ).join('');
    kdramaGenresContainer.innerHTML = kdramaHtml;
    
    kdramaGenresContainer.querySelectorAll('.genre-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        kdramaGenresContainer.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const genreId = btn.dataset.genre === 'all' ? null : parseInt(btn.dataset.genre);
        currentTVGenre = genreId;
        loadKDramas(1, genreId);
      });
    });
  }
  
  // Anime genres
  const animeGenresContainer = document.getElementById('animeGenres');
  if (animeGenresContainer) {
    let animeHtml = '<button class="genre-btn active" data-genre="all">All</button>';
    animeHtml += TV_GENRES.slice(0, 8).map(g => 
      `<button class="genre-btn" data-genre="${g.id}">${g.name}</button>`
    ).join('');
    animeGenresContainer.innerHTML = animeHtml;
    
    animeGenresContainer.querySelectorAll('.genre-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        animeGenresContainer.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const genreId = btn.dataset.genre === 'all' ? null : parseInt(btn.dataset.genre);
        currentTVGenre = genreId;
        loadAnime(1, genreId);
      });
    });
  }
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
      fetch(API(`search/movie?query=${encodeURIComponent(query)}`)),
      fetch(API(`search/tv?query=${encodeURIComponent(query)}`))
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
      fetch(API(`search/movie?query=${encodeURIComponent(query)}`)),
      fetch(API(`search/tv?query=${encodeURIComponent(query)}`))
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
    const res = await fetch(API(`search/movie?query=${encodeURIComponent(query)}`));
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

  // Add click handlers
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
    const res = await fetch(API('trending/movie/week'));
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
    const res = await fetch(API('discover/tv?with_origin_country=KR&sort_by=popularity.desc'));
    const data = await res.json();

    // Add media_type to each item for proper handling
    const kdramas = (data.results || []).map(item => ({...item, media_type: 'tv'}));
    renderSection(popularKdramasRow, kdramas);
  } catch (error) {
    console.error('Failed to load K-Dramas:', error);
  }
}

// Load Top Anime
async function loadTopAnime() {
  try {
    // Use discover TV with anime genre (ID: 16) and animation
    const res = await fetch(API('discover/tv?with_genres=16&sort_by=popularity.desc'));
    const data = await res.json();

    // Add media_type to each item for proper handling
    const anime = (data.results || []).map(item => ({...item, media_type: 'tv'}));
    renderSection(topAnimeRow, anime);
  } catch (error) {
    console.error('Failed to load Anime:', error);
  }
}

// Load New Releases
async function loadNewReleases() {
  try {
    const res = await fetch(API('movie/now_playing?language=en-US'));
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
  const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'%3E%3Crect fill='%230f1520' width='100' height='150'/%3E%3Ctext x='50' y='75' text-anchor='middle' fill='%236b7a8d' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
  card.innerHTML = `
    <img class="card-thumb" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy" onerror="this.src='${fallbackImg}'">
    <div class="card-overlay">
      <span class="card-title">${movie.title || movie.name}</span>
    </div>
  `;
  card.onclick = () => openDetail(movie);
  return card;
}

// Open detail modal
function openDetail(movie) {
  const title = movie.title || movie.name;
  
  detailTitle.textContent = title;
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
  
  // Store original title for TV shows (used in playEpisode)
  if (playType === 'tv') {
    originalTitle = title;
    loadTVShowDetails(movie.id);
  } else {
    epControls.style.display = 'none';
  }
  
  document.getElementById('detailPlay').onclick = () => {
    if (playType === 'tv') {
      // For TV shows, play the current selected episode
      playEpisode(movie.id, currentSeason, currentEpisode);
    } else {
      playMovie(movie.id, title, playType);
    }
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
  originalTitle = title; // Store the original title
  modalTitle.textContent = ''; // Clear existing title before setting new one
  modalTitle.textContent = title;
  modalSub.textContent = '';
  loadPlayer(id, type);
  playerModal.style.display = 'flex';
  
  // Save watch progress for movies
  if (type === 'movie') {
    saveWatchProgress(id, type);
  }
}

// Fetch detail by ID (for search results)
async function fetchDetail(id, type) {
  try {
    const endpoint = type === 'movie' ? `movie/${id}` : `tv/${id}`;
    const res = await fetch(API(endpoint));
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

// Clear continue watching
function clearContinue() {
  localStorage.removeItem('zrn_continue');
  document.getElementById('continueSection').style.display = 'none';
}

// ============ PAGE DATA LOADERS ============

// Movies Page
let moviesPage = 1;
async function loadMovies(page = 1, genreId = null) {
  try {
    let endpoint = `discover/movie?sort_by=popularity.desc&page=${page}`;
    if (genreId) {
      endpoint = `discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
    }
    const res = await fetch(API(endpoint));
    const data = await res.json();
    renderGrid('movieGrid', data.results || [], page > 1);
    moviesPage = page;
  } catch (error) {
    console.error('Failed to load movies:', error);
  }
}

document.getElementById('loadMoreMovies')?.addEventListener('click', () => loadMovies(moviesPage + 1, currentMovieGenre));

// K-Drama Page
let kdramaPage = 1;
async function loadKDramas(page = 1, genreId = null) {
  try {
    let endpoint = `discover/tv?with_origin_country=KR&sort_by=popularity.desc&page=${page}`;
    if (genreId) {
      endpoint = `discover/tv?with_origin_country=KR&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
    }
    const res = await fetch(API(endpoint));
    const data = await res.json();
    // Add media_type to each item for proper handling
    const kdramas = (data.results || []).map(item => ({...item, media_type: 'tv'}));
    renderGrid('kdramaGrid', kdramas, page > 1);
    kdramaPage = page;
  } catch (error) {
    console.error('Failed to load K-Dramas:', error);
  }
}

document.getElementById('loadMoreKdrama')?.addEventListener('click', () => loadKDramas(kdramaPage + 1, currentTVGenre));

// Anime Page
let animePage = 1;
async function loadAnime(page = 1, genreId = null) {
  try {
    let endpoint = `discover/tv?with_genres=16&sort_by=popularity.desc&page=${page}`;
    if (genreId) {
      endpoint = `discover/tv?with_genres=16,${genreId}&sort_by=popularity.desc&page=${page}`;
    }
    const res = await fetch(API(endpoint));
    const data = await res.json();
    // Add media_type: 'tv' to all anime results since they're TV shows
    const animeWithType = (data.results || []).map(item => ({ ...item, media_type: 'tv' }));
    renderGrid('animeGrid', animeWithType, page > 1);
    animePage = page;
  } catch (error) {
    console.error('Failed to load Anime:', error);
  }
}

document.getElementById('loadMoreAnime')?.addEventListener('click', () => loadAnime(animePage + 1, currentTVGenre));

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
  
  const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'%3E%3Crect fill='%230f1520' width='100' height='150'/%3E%3Ctext x='50' y='75' text-anchor='middle' fill='%236b7a8d' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
  
  items.forEach(item => {
    if (!item.poster_path) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="card-thumb" src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${item.title || item.name}" loading="lazy" onerror="this.src='${fallbackImg}'">
      <div class="card-overlay">
        <span class="card-title">${item.title || item.name}</span>
      </div>
    `;
    card.onclick = () => openDetail(item);
    container.appendChild(card);
  });
}

// ============ EPISODE SELECTOR ============

// Initialize episode selector
function initEpisodeSelector() {
  if (!seasonSelect || !episodeSelect || !loadEpBtn) return;
  
  seasonSelect.addEventListener('change', async () => {
    currentSeason = parseInt(seasonSelect.value);
    await loadEpisodes(currentTVId, currentSeason);
  });
  
  episodeSelect.addEventListener('change', () => {
    currentEpisode = parseInt(episodeSelect.value);
  });
  
  loadEpBtn.addEventListener('click', () => {
    if (currentTVId && currentSeason && currentEpisode) {
      playEpisode(currentTVId, currentSeason, currentEpisode);
    }
  });
}

// Load TV show details (seasons) - with caching
async function loadTVShowDetails(tvId) {
  currentTVId = tvId;
  tvSeasonsData = {};
  
  // Show loading state
  if (seasonSelect) seasonSelect.innerHTML = '<option value="">Loading...</option>';
  if (episodeSelect) episodeSelect.innerHTML = '<option value="">Loading...</option>';
  
  try {
    // Use fetchWithRetry for caching and retry logic
    const data = await fetchWithRetry(
      `tv/${tvId}`,
      {
        cacheKey: `tv_${tvId}`,
        cacheDuration: CACHE_DURATION.showDetails
      }
    );
    
    if (data.seasons && data.seasons.length > 0) {
      // Filter and sort seasons, limit to first 10 for performance
      const seasons = data.seasons
        .filter(s => s.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number)
        .slice(0, 10);
      
      const hasMoreSeasons = data.seasons.filter(s => s.season_number > 0).length > 10;
      
      seasonSelect.innerHTML = seasons.map(s => 
        `<option value="${s.season_number}">Season ${s.season_number}</option>`
      ).join('');
      
      // Add "Load More" option if show has many seasons
      if (hasMoreSeasons) {
        seasonSelect.innerHTML += `<option value="more">+ More seasons...</option>`;
      }
      
      currentSeason = 1;
      seasonSelect.value = '1';
      
      // Enable season selector
      seasonSelect.disabled = false;
      
      await loadEpisodes(tvId, 1);
      epControls.style.display = 'block';
    } else {
      epControls.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load TV show details:', error);
    if (seasonSelect) seasonSelect.innerHTML = '<option value="">Failed to load</option>';
    epControls.style.display = 'none';
    showToast('Failed to load show. Tap to retry.', 'error');
  }
}

// Handle "Load More" seasons click
seasonSelect?.addEventListener('click', async function() {
  if (this.value === 'more' && currentTVId) {
    try {
      const data = await fetchWithRetry(
        `tv/${currentTVId}`,
        { cacheKey: `tv_${currentTVId}`, cacheDuration: CACHE_DURATION.showDetails }
      );
      
      if (data.seasons) {
        const allSeasons = data.seasons
          .filter(s => s.season_number > 0)
          .sort((a, b) => a.season_number - b.season_number);
        
        seasonSelect.innerHTML = allSeasons.map(s => 
          `<option value="${s.season_number}">Season ${s.season_number}</option>`
        ).join('');
        seasonSelect.value = currentSeason;
        showToast(`Loaded ${allSeasons.length} seasons`);
      }
    } catch (error) {
      console.error('Failed to load more seasons:', error);
    }
  }
});

// Load episodes for a season - with caching and retry
async function loadEpisodes(tvId, seasonNumber) {
  // Check cache first
  if (tvSeasonsData[seasonNumber]) {
    populateEpisodeDropdown(tvSeasonsData[seasonNumber]);
    return;
  }
  
  // Show loading state
  if (episodeSelect) {
    episodeSelect.innerHTML = '<option value="">Loading...</option>';
    episodeSelect.disabled = true;
  }
  
  try {
    const data = await fetchWithRetry(
      `tv/${tvId}/season/${seasonNumber}`,
      {
        cacheKey: `ep_${tvId}_${seasonNumber}`,
        cacheDuration: CACHE_DURATION.episodes
      }
    );
    
    const episodes = data.episodes || [];
    
    // Cache episodes
    tvSeasonsData[seasonNumber] = episodes;
    
    populateEpisodeDropdown(episodes);
    
    // Re-enable episode selector
    if (episodeSelect) episodeSelect.disabled = false;
    
  } catch (error) {
    console.error('Failed to load episodes:', error);
    if (episodeSelect) {
      episodeSelect.innerHTML = '<option value="">Failed to load</option>';
    }
    showToast('Failed to load episodes. Tap to retry.', 'error');
  }
}

// Populate episode dropdown
function populateEpisodeDropdown(episodes) {
  if (!episodes || episodes.length === 0) {
    episodeSelect.innerHTML = '<option value="">No episodes</option>';
    return;
  }
  
  episodeSelect.innerHTML = episodes.map(ep => {
    const epNum = ep.episode_number.toString().padStart(2, '0');
    const title = ep.name || `Episode ${epNum}`;
    return `<option value="${ep.episode_number}">${epNum} - ${title}</option>`
  }).join('');
  
  currentEpisode = 1;
  episodeSelect.value = '1';
}

// Play episode - using helper functions for URL building
function playEpisode(tvId, season, episode) {
  const epNum = episode.toString().padStart(2, '0');
  const seasonNum = season.toString().padStart(2, '0');
  
  // Use originalTitle instead of modalTitle.textContent to avoid incrementing
  modalTitle.textContent = ''; // Clear existing title before setting new one
  modalTitle.textContent = `${originalTitle} - S${seasonNum}E${epNum}`;
  modalSub.textContent = `Season ${season} Episode ${episode}`;
  
  // Use the helper function to build the episode URL
  const server = VIDEO_SERVERS.find(s => s.id === currentServer) || VIDEO_SERVERS[0];
  const embedUrl = buildEpisodeUrl(server, tvId, season, episode);
  
  console.log('Playing episode:', embedUrl);
  
  playerFrame.src = embedUrl;
  playerModal.style.display = 'flex';
  saveWatchProgress(tvId, 'tv', season, episode);
}

// ============ KEYBOARD SHORTCUTS ============

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
        closeAllModals();
        forceReleaseFullscreen();
      }
      return;
    }
    
    switch(e.key) {
      case 'Escape':
        // First try to exit fullscreen if active
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          forceReleaseFullscreen();
        } else {
          closeAllModals();
        }
        break;
      case '/':
        e.preventDefault();
        searchInput.focus();
        break;
      case 'f':
      case 'F':
        if (playerModal.style.display === 'flex') {
          toggleFullscreen();
        }
        break;
    }
  });
  
  // Also handle click on document to catch stuck pointer events
  document.addEventListener('click', () => {
    // If pointer events seem stuck after fullscreen, this can help reset
    if (playerFrame && playerFrame.style.pointerEvents === 'none') {
      playerFrame.style.pointerEvents = 'auto';
    }
  }, true);
}

function closeAllModals() {
  detailModal.style.display = 'none';
  playerFrame.src = '';
  playerModal.style.display = 'none';
  
  const mobileSearch = document.getElementById('mobileSearch');
  if (mobileSearch) {
    mobileSearch.classList.remove('active');
  }
}

function toggleFullscreen() {
  const playerWrap = document.querySelector('.player-wrap');
  if (!playerWrap) return;
  
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (playerWrap.requestFullscreen) {
    playerWrap.requestFullscreen();
  }
}

// ============ SCROLL TO TOP BUTTON ============

function initScrollToTop() {
  const btn = document.createElement('button');
  btn.id = 'scrollToTop';
  btn.innerHTML = '↑';
  btn.title = 'Scroll to top';
  btn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  btn.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 18px;
    cursor: pointer;
    z-index: 99;
    display: none;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  });
  
  btn.onmouseenter = () => {
    btn.style.borderColor = 'var(--accent)';
    btn.style.color = 'var(--accent)';
  };
  btn.onmouseleave = () => {
    btn.style.borderColor = 'var(--border)';
    btn.style.color = 'var(--text)';
  };
  
  document.body.appendChild(btn);
}

// ============ WATCH PROGRESS / CONTINUE WATCHING ============

function saveWatchProgress(id, type, season = 1, episode = 1) {
  let continueWatching = JSON.parse(localStorage.getItem('zrn_continue') || '[]');
  
  continueWatching = continueWatching.filter(item => !(item.id === id && item.media_type === type));
  
  continueWatching.unshift({
    id,
    media_type: type,
    season,
    episode,
    updated_at: Date.now()
  });
  
  continueWatching = continueWatching.slice(0, 20);
  localStorage.setItem('zrn_continue', JSON.stringify(continueWatching));
  displayContinueWatching();
}

async function displayContinueWatching() {
  const continueWatching = JSON.parse(localStorage.getItem('zrn_continue') || '[]');
  const continueSection = document.getElementById('continueSection');
  const continueRow = document.getElementById('continueRow');
  
  if (!continueSection || !continueRow) return;
  
  if (continueWatching.length === 0) {
    continueSection.style.display = 'none';
    return;
  }
  
  continueSection.style.display = 'block';
  continueRow.innerHTML = '';
  
  const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'%3E%3Crect fill='%230f1520' width='100' height='150'/%3E%3Ctext x='50' y='75' text-anchor='middle' fill='%236b7a8d' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
  
  for (const item of continueWatching.slice(0, 10)) {
    try {
      const endpoint = item.media_type === 'movie' ? `movie/${item.id}` : `tv/${item.id}`;
      const res = await fetch(API(endpoint));
      const data = await res.json();
      
      if (!data.poster_path) continue;
      
      const card = document.createElement('div');
      card.className = 'card';
      
      const title = data.title || data.name;
      let subtitle = '';
      if (item.media_type === 'tv') {
        subtitle = `S${item.season.toString().padStart(2, '0')}E${item.episode.toString().padStart(2, '0')}`;
      }
      
      card.innerHTML = `
        <img class="card-thumb" src="https://image.tmdb.org/t/p/w300${data.poster_path}" alt="${title}" loading="lazy" onerror="this.src='${fallbackImg}'">
        <div class="card-overlay">
          <span class="card-title">${title}</span>
          ${subtitle ? `<span class="card-meta-ov">${subtitle}</span>` : ''}
        </div>
      `;
      
      card.onclick = () => {
        if (item.media_type === 'tv') {
          playEpisode(item.id, item.season, item.episode);
        } else {
          playMovie(item.id, title, 'movie');
        }
      };
      
      continueRow.appendChild(card);
    } catch (error) {
      console.error('Failed to load continue watching item:', error);
    }
  }
}
