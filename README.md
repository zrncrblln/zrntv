# 🎬 StreamVault — All-in-One Streaming WebApp

A sleek, dark-themed streaming webapp to watch **Movies**, **K-Dramas**, and **Anime** — all in one place.

![StreamVault Preview](https://via.placeholder.com/1200x600/080c10/e8b44b?text=StreamVault)

## ✨ Features

- 🎬 **Movies** — Browse and stream thousands of movies
- 📺 **K-Drama** — Full Korean drama library with season/episode selector
- ⚡ **Anime** — Japanese anime browsing with genre filters
- 🔍 **Search** — Live search across all content types
- 🔖 **Watchlist** — Save titles to watch later (stored locally)
- ▶️ **Continue Watching** — Pick up where you left off
- 🎭 **Genre Filters** — Browse by genre on each page
- 📱 **Responsive** — Works on mobile & desktop
- 🎞️ **Multiple Sources** — VidSrc, 2Embed, VidSrc.me

## 🚀 Quick Start

### 1. Get a FREE TMDB API Key

1. Go to [themoviedb.org](https://www.themoviedb.org/signup) and create a free account
2. Go to **Settings → API → Request an API Key**
3. Choose "Developer" and fill out the form (free, instant approval)
4. Copy your **API Key (v3 auth)**

### 2. Add Your API Key

Open `app.js` and find line 6:
```js
const TMDB_KEY = 'YOUR_TMDB_API_KEY_HERE';
```
Replace `YOUR_TMDB_API_KEY_HERE` with your actual API key.

### 3. Run Locally

Just open `index.html` in your browser — no build step needed!

Or use a local server:
```bash
npx serve .
# or
python3 -m http.server 8080
```

## 🌐 Deploy to GitHub Pages

### Option A: Drag & Drop (Easiest)
1. Create a new GitHub repository
2. Upload all 3 files (`index.html`, `style.css`, `app.js`)
3. Go to **Settings → Pages**
4. Set Source to **Deploy from branch → main → / (root)**
5. Your site will be live at `https://yourusername.github.io/your-repo-name`

### Option B: Git CLI
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/streamvault.git
git push -u origin main
```
Then enable GitHub Pages in repository settings.

## 📁 Project Structure

```
streamvault/
├── index.html    # App structure & layout
├── style.css     # All styles & animations
├── app.js        # Logic, API calls, state
└── README.md     # This file
```

## 🎬 Streaming Sources

| Source | Movies | TV/Anime |
|--------|--------|----------|
| VidSrc | ✅ | ✅ |
| 2Embed | ✅ | ✅ |
| VidSrc.me | ✅ | ✅ |

> **Note:** Streaming sources are third-party embeds. Availability may vary by title and region. This app is for personal/educational use only.

## 🔧 Tech Stack

- Vanilla **HTML5 / CSS3 / JavaScript** (no frameworks!)
- **TMDB API** for metadata (free)
- **VidSrc / 2Embed** for streaming embeds
- Google Fonts (Bebas Neue, DM Sans, DM Mono)
- **localStorage** for watchlist & continue watching

## ⚠️ Disclaimer

This project is intended for educational/personal use. StreamVault does not host any media files. All streams are embedded from third-party sources. Respect copyright laws in your jurisdiction.

---

Made with ❤️ | Powered by [TMDB](https://www.themoviedb.org/)
