const TMDB_KEY = "c138886a68189d4f50a36bd5fe53e588";
const BASE_URL = "https://api.themoviedb.org/3";

const fetchTMDB = async (endpoint, params = {}) => {
  const query = new URLSearchParams({ api_key: TMDB_KEY, ...params }).toString();
  const res = await fetch(`${BASE_URL}${endpoint}?${query}`);
  return res.json();
};

export const tmdb = {
  trending: () => fetchTMDB("/trending/all/week"),
  searchMovie: (query) => fetchTMDB("/search/movie", { query }),
  searchTV: (query) => fetchTMDB("/search/tv", { query }),
  discoverTV: (params) => fetchTMDB("/discover/tv", params),
  movieNowPlaying: () => fetchTMDB("/movie/now_playing"),
  getMovieDetails: (id) => fetchTMDB(`/movie/${id}`),
  getTVDetails: (id) => fetchTMDB(`/tv/${id}`),
  getMovieCredits: (id) => fetchTMDB(`/movie/${id}/credits`),
  getTVCredits: (id) => fetchTMDB(`/tv/${id}/credits`),
  getMovieProviders: (id) => fetchTMDB(`/movie/${id}/watch/providers`),
  getTVProviders: (id) => fetchTMDB(`/tv/${id}/watch/providers`)
};
