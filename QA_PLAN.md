# ZRN TV - Quality Assurance Test Plan

## Project Overview
- **Project**: ZRN TV - Streaming Web Application
- **Type**: Full-stack web application (Express API + Vanilla JS frontend)
- **Core Functionality**: Movie/TV streaming platform with search, watchlist, and multi-server video playback

---

## 1. API Testing (apps/api)

### 1.1 Rate Limiting
- [ ] Test rate limit middleware blocks excessive requests
- [ ] Verify rate limit headers are present in responses
- [ ] Test rate limit resets after timeout

### 1.2 TMDB Proxy Routes
- [ ] Test `/api/tmdb/trending/movie/week` returns valid data
- [ ] Test `/api/tmdb/trending/tv/week` returns valid data
- [ ] Test `/api/tmdb/search/movie?query=...` returns movie results
- [ ] Test `/api/tmdb/search/tv?query=...` returns TV show results
- [ ] Test `/api/tmdb/discover/movie` returns movie list
- [ ] Test `/api/tmdb/discover/tv` returns TV show list
- [ ] Test `/api/tmdb/movie/{id}` returns movie details
- [ ] Test `/api/tmdb/tv/{id}` returns TV show details
- [ ] Test error handling when TMDB API fails

### 1.3 API Security
- [ ] Test CORS configuration
- [ ] Verify no sensitive data exposure in error responses

---

## 2. Frontend Functionality Testing (apps/web)

### 2.1 Navigation
- [ ] Test all nav tabs (Home, Movies, K-Drama, Anime, Watchlist) navigate correctly
- [ ] Test mobile navigation works
- [ ] Test page content loads on tab switch
- [ ] Verify active tab highlighting

### 2.2 Hero Section
- [ ] Test trending movie loads in hero section
- [ ] Test hero background image displays
- [ ] Test "Play Now" button opens player
- [ ] Test "Add to Watchlist" button works
- [ ] Test hero content shows loading state initially

### 2.3 Content Sections
- [ ] Test "Trending Movies" section loads and displays cards
- [ ] Test "Popular K-Dramas" section loads (filtered by KR origin)
- [ ] Test "Top Anime" section loads (genre 16)
- [ ] Test "New Releases" section loads
- [ ] Test cards are clickable and open detail modal
- [ ] Test lazy loading of card images

### 2.4 Search Functionality
- [ ] Test desktop search input filters results
- [ ] Test search returns both movies and TV shows
- [ ] Test search results are sorted by popularity
- [ ] Test search shows "No results found" for empty queries
- [ ] Test clicking search item opens detail modal
- [ ] Test mobile search overlay opens/closes
- [ ] Test mobile search returns combined results
- [ ] Test search results close when clicking outside

### 2.5 Detail Modal
- [ ] Test modal displays movie/TV show title
- [ ] Test modal displays overview/description
- [ ] Test modal displays poster image
- [ ] Test modal displays rating badge
- [ ] Test modal displays year and media type
- [ ] Test "Play Now" button in modal opens player
- [ ] Test "Add to Watchlist" button in modal works
- [ ] Test modal closes on X button click
- [ ] Test modal closes on overlay click

### 2.6 Video Player
- [ ] Test player modal opens with video
- [ ] Test multiple video servers (VidSrc, VidSrc.me, etc.)
- [ ] Test server switching updates player
- [ ] Test preferred server persists in localStorage
- [ ] Test fullscreen button works
- [ ] Test player modal closes and stops video
- [ ] Test player closes on X button click
- [ ] Test player closes on overlay click

### 2.7 Watchlist
- [ ] Test adding items to watchlist
- [ ] Test duplicate items show "Already in watchlist" toast
- [ ] Test watchlist page displays saved items
- [ ] Test empty watchlist shows empty state message
- [ ] Test watchlist persists across page refresh
- [ ] Test watchlist items are clickable

### 2.8 Pagination
- [ ] Test "Load More" button on Movies page
- [ ] Test "Load More" button on K-Drama page
- [ ] Test "Load More" button on Anime page
- [ ] Verify new results append to existing grid

### 2.9 Responsive Design
- [ ] Test mobile navigation appears on small screens
- [ ] Test mobile search overlay works
- [ ] Test grid adapts to screen size
- [ ] Test navbar collapses on scroll

---

## 3. User Interface / Visual Testing

### 3.1 Layout
- [ ] Verify navbar stays fixed on scroll
- [ ] Verify hero section spans full width
- [ ] Verify content sections have proper spacing
- [ ] Verify footer displays correctly
- [ ] Test horizontal scroll in content rows

### 3.2 Styling
- [ ] Verify fonts load correctly (Bebas Neue, DM Sans, DM Mono)
- [ ] Verify Font Awesome icons display
- [ ] Test dark theme / color scheme
- [ ] Verify card hover effects
- [ ] Test modal transitions/animations

### 3.3 Error States
- [ ] Test UI when API fails to load
- [ ] Test UI when network is offline
- [ ] Test broken image handling
- [ ] Test empty search results display

---

## 4. Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)

---

## 5. Performance Testing
- [ ] Test initial page load time
- [ ] Test API response times
- [ ] Test image loading performance
- [ ] Test scroll performance with many cards

---

## 6. Data Integrity
- [ ] Verify TMDB image URLs are correct format
- [ ] Verify date formats are consistent
- [ ] Verify media type detection (movie vs TV)
- [ ] Verify search combines and sorts results correctly

---

## 7. Edge Cases
- [ ] Test with very long movie titles
- [ ] Test with movies that have no poster
- [ ] Test with movies that have no overview
- [ ] Test with special characters in search query
- [ ] Test rapid navigation between tabs
- [ ] Test adding same item to watchlist multiple times
- [ ] Test player with invalid video ID

---

## Priority Test Matrix

| Priority | Feature | Test Cases |
|----------|---------|------------|
| P0 | API Proxy | All TMDB route tests |
| P0 | Video Player | Server switching, fullscreen |
| P0 | Search | Desktop & mobile search |
| P1 | Navigation | Tab switching, page loads |
| P1 | Watchlist | Add, view, persistence |
| P1 | Detail Modal | Display, actions |
| P2 | Responsive | Mobile layout |
| P2 | Performance | Load times |
| P3 | Visual | Styling, animations |

---

## Known Issues / Notes
- Video servers (vidsrc.to, vidplay, streamtape, etc.) are external embeds - QA should verify at least one works
- TMDB API key is hardcoded as fallback - should use environment variable in production
- Rate limiting is basic - may need tuning for production use
