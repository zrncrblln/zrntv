# ZRN TV - Feature Implementation TODO List

## Phase 1: Essential Features (Weeks 1-3)

### Week 1: TV Show Episode Selector
- [x] 1.1 Add season selector dropdown to TV show details
- [x] 1.2 Add episode selector dropdown
- [x] 1.3 Implement loadTVShowDetails() function
- [x] 1.4 Implement loadEpisodes() function
- [x] 1.5 Update player to handle episode URLs (season/episode format)
- [x] 1.6 Display SxE info in modal title

### Week 2: Genre Filtering System
- [x] 2.1 Add MOVIE_GENRES and TV_GENRES constants
- [x] 2.2 Create initGenreFilters() function
- [x] 2.3 Create filterByGenre() function
- [x] 2.4 Add genre buttons to movie and TV sections
- [x] 2.5 Connect filters to grid rendering

### Week 3: Loading States & Security Fix
- [x] 3.1 Add skeleton CSS styles
- [ ] 3.2 Create showLoadingSkeleton() function
- [ ] 3.3 Add skeleton loading to all API calls
- [ ] 3.4 Create simple Node.js backend proxy server
- [ ] 3.5 Update frontend API calls to use proxy

---

## Phase 2: High Value Features (Weeks 4-7)

### Week 4: Continue Watching
- [x] 4.1 Create saveWatchProgress() function
- [x] 4.2 Add watch history to localStorage
- [x] 4.3 Create displayContinueWatching() function
- [ ] 4.4 Add progress bar to cards
- [x] 4.5 Add resume watching functionality
- [x] 4.6 Limit history to 20 items

### Week 5: Trailer Support
- [ ] 5.1 Create fetchTrailer() function
- [ ] 5.2 Add trailer button to detail modal
- [ ] 5.3 Create playTrailer() function
- [ ] 5.4 Update modal to handle trailer mode

### Week 6: Advanced Search
- [ ] 6.1 Add search filters HTML (type, year, rating)
- [ ] 6.2 Create advancedSearch() function
- [ ] 6.3 Add filter dropdowns to search UI
- [ ] 6.4 Connect filters to search results

### Week 7: Cast & Crew Information
- [ ] 7.1 Create loadCast() function
- [ ] 7.2 Add cast section to detail modal
- [ ] 7.3 Add horizontal scroll for cast cards
- [ ] 7.4 Add image error fallback

---

## Phase 3: Polish Features (Weeks 8-10)

### Week 8: Keyboard Shortcuts & UX
- [x] 8.1 Add ESC to close modals
- [x] 8.2 Add '/' to focus search
- [x] 8.3 Add 'F' for fullscreen in player
- [x] 8.4 Improve error messages
- [x] 8.5 Add "scroll to top" button

### Week 9: Similar Content & Caching
- [ ] 9.1 Create loadSimilarContent() function
- [ ] 9.2 Add similar section to detail modal
- [ ] 9.3 Implement request caching
- [ ] 9.4 Add cache expiry logic

### Week 10: Animated Transitions
- [ ] 10.1 Add page fade-in animations
- [ ] 10.2 Enhance card hover effects
- [x] 10.3 Add modal entrance animations
- [x] 10.4 Add skeleton loading animations

---

## Phase 4: Advanced Features (Weeks 11-16)

### Week 11-12: Progressive Web App (PWA)
- [ ] 11.1 Create manifest.json
- [ ] 11.2 Create service-worker.js
- [ ] 11.3 Add offline fallback page
- [ ] 11.4 Configure caching strategies

### Week 13-14: User Profiles & Watchlists
- [ ] 13.1 Create multiple watchlists structure
- [ ] 13.2 Add watchlist selector UI
- [ ] 13.3 Implement createWatchlist() function
- [ ] 13.4 Implement addToList() function

### Week 15: Viewing Preferences
- [ ] 15.1 Create preferences modal
- [ ] 15.2 Add autoplay, quality, subtitle settings
- [ ] 15.3 Save preferences to localStorage
- [ ] 15.4 Apply preferences on load

### Week 16: Watch Statistics
- [ ] 16.1 Create stats tracking system
- [ ] 16.2 Calculate movies/shows watched
- [ ] 16.3 Track watch time
- [ ] 16.4 Create stats display page

---

## Phase 5: Mobile Excellence (Weeks 17-18)

### Week 17: Mobile Gestures
- [ ] 17.1 Implement pull-to-refresh
- [ ] 17.2 Add swipe to close modals
- [ ] 17.3 Improve touch interactions

### Week 18: Theme & Polish
- [ ] 18.1 Add dark/light theme toggle
- [ ] 18.2 Create theme CSS variables
- [x] 18.3 Add empty states
- [x] 18.4 Final UI polish

---

## Quick Wins (Can be done immediately)

- [x] Add ESC key to close all modals (5 min)
- [x] Add loading spinner (15 min)
- [x] Improve error messages (30 min)
- [x] Add image error fallbacks (15 min)
- [x] Add "scroll to top" button (20 min)

---

## Implementation Notes

### Priority Order:
1. Security (Backend proxy) - Week 3
2. Core features (Episode selector, Genre filters) - Weeks 1-2
3. UX (Loading states) - Week 3
4. Engagement (Continue watching, Trailers) - Weeks 4-5
5. Polish (Animations, Theme toggle) - Weeks 9-10, 18

### Dependencies:
- Phase 1 must be completed before Phase 2
- Phase 2 must be completed before Phase 3
- Phases 4 and 5 can run in parallel

### Testing Checklist:
- [x] All API endpoints work correctly
- [x] UI is responsive on mobile devices
- [x] All modals open/close properly
- [x] Search and filters return correct results
- [x] Watch history persists across sessions
- [ ] Theme toggle works correctly
- [x] No console errors on any page
