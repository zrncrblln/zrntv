const API = import.meta.env.VITE_API_URL;
export const tmdb = {
  trending: () => fetch(`${API}/tmdb/trending/all/week`).then(r => r.json())
};