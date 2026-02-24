# ZRN TV - QA Testing Tasks

## Current Phase: Quality Assurance Testing

## API Testing ✅ PASSED
- [x] Test rate limit middleware (Basic rate limiting enabled in express-rate-limit)
- [x] Test TMDB proxy routes (trending, search, discover, details)
  - [x] `/api/tmdb/trending/movie/week` - Working
  - [x] `/api/tmdb/search/movie?query=avatar` - Working
  - [x] `/api/tmdb/search/tv?query=squid` - Working  
  - [x] `/api/tmdb/discover/tv?with_origin_country=KR` - Working (K-Dramas)
  - [x] `/api/tmdb/discover/tv?with_genres=16` - Working (Anime)
- [x] Test error handling (returns 500 with error message on TMDB failure)
- [x] Test CORS configuration (CORS enabled)

## Code Review Findings ✅ COMPLETED
- [x] Search for console statements (11 console.error found - acceptable for debugging)
- [x] Check for XSS vulnerabilities (innerHTML used with TMDB data - medium risk)
- [x] Identify unused code (searchMovies function unused)
- [x] Review error handling consistency
- [x] Create detailed bug report (QA_BUGS.md created)

## Frontend Functionality Testing
- [ ] Test navigation (desktop & mobile) - Manual test required
- [ ] Test hero section - Manual test required
- [ ] Test content sections (Trending, K-Drama, Anime, New Releases) - Manual test required
- [ ] Test search (desktop & mobile) - Manual test required
- [ ] Test detail modal - Manual test required
- [ ] Test video player with server switching - Manual test required
- [ ] Test watchlist functionality - Manual test required
- [ ] Test pagination/Load More - Manual test required

## UI/Visual Testing
- [ ] Test responsive design - Manual test required
- [ ] Test error states - Manual test required
- [ ] Test browser compatibility - Manual test required
- [ ] Test performance - Manual test required

## Edge Cases
- [ ] Test long titles - Manual test required
- [ ] Test missing posters/overviews - Manual test required
- [ ] Test special characters in search - Manual test required
- [ ] Test rapid navigation - Manual test required

---

## Previous Tasks (Completed)

### Search Bar Task
- [x] Fix selector bug in displaySearchResults
- [x] Enhance search to support movies and TV shows
- [x] Add mobile search bar
- [x] Add mobile search styles

### Video Servers & Fullscreen Fix
- [x] Add multiple video server options
- [x] Create server selection UI
- [x] Update playMovie for server selection
- [x] Store preferred server in localStorage
- [x] Fix fullscreen functionality
