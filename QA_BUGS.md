# ZRN TV - QA Bug Report

## Critical Issues
None found.

## High Priority Issues

### 1. XSS Vulnerability - innerHTML Usage
**Severity:** Medium  
**Location:** `apps/web/app.js` (multiple locations)

**Description:** The code uses `innerHTML` to render user data from the TMDB API directly into the DOM. While TMDB is a trusted source, this pattern could be dangerous if the API response is compromised or if the code is refactored to use user-generated content.

**Affected Lines:**
- Search results rendering
- Mobile search results
- Movie/TV cards
- Grid containers

**Recommendation:** Use `textContent` or create elements programmatically when possible, or sanitize data before rendering.

---

### 2. Missing Error User Feedback
**Severity:** Medium  
**Location:** `apps/web/app.js`

**Description:** While console.error is used for error logging, users don't see meaningful error messages in the UI when:
- Content fails to load
- Search fails
- Network errors occur

**Recommendation:** Add toast notifications or inline error messages for failed API calls.

---

### 3. Unclosed Resource - Image Loading
**Severity:** Low  
**Location:** `apps/web/app.js`

**Description:** The code uses `<img loading="lazy">` but there's no error handling for broken image URLs. If TMDB returns a null poster_path or the image fails to load, users see broken image icons.

**Recommendation:** Add onerror handler for images to show a placeholder.

---

### 4. Memory Leak Potential - Event Listeners
**Severity:** Low  
**Location:** `apps/web/app.js`

**Description:** Event listeners are added to dynamically created elements, but there's no cleanup when elements are removed/re-rendered. This could lead to memory leaks in long-running sessions.

**Recommendation:** Consider using event delegation or proper cleanup.

---

### 5. Missing Input Validation - Search
**Severity:** Low  
**Location:** `apps/web/app.js`

**Description:** Search queries are sent directly to the API without sanitization. While the API handles this, very long queries could be sent.

**Recommendation:** Add client-side query length validation.

---

## Code Quality Observations

### Console Logging
**Finding:** 11 console.error statements exist in the codebase.

**Status:** Acceptable for debugging purposes, but should be removed or replaced with proper logging in production.

---

### Unused Code
**Finding:** In `apps/web/app.js`:
- `searchMovies()` function is defined but appears unused (searchAll is used instead)
- `fetchDetail()` function may be redundant with `openDetail()`

**Recommendation:** Clean up unused functions.

---

### Inconsistent Error Handling
**Finding:** Some functions silently fail (e.g., `loadPopularKdramas`, `loadTopAnime`) while others update the UI (e.g., `loadTrending` sets heroTitle to "Failed to load").

**Recommendation:** Standardize error handling across all functions.

---

## Test Coverage Gaps

1. **Rate Limiting:** Not tested under heavy load
2. **Video Player:** External embeds (VidSrc, etc.) not tested - need to verify at least one works
3. **LocalStorage:** Watchlist persistence tested manually, not automated
4. **Responsive Design:** Need to test on actual mobile devices
5. **Browser Compatibility:** Only tested API via curl, not browser-specific features

---

## Recommendations Summary

| Priority | Issue | Recommendation |
|----------|-------|----------------|
| High | XSS potential | Use textContent or sanitize |
| High | Error feedback | Add toast messages |
| Medium | Broken images | Add error placeholder |
| Low | Event cleanup | Use delegation |
| Low | Search validation | Limit query length |
