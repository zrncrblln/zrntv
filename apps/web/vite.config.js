import { defineConfig } from "vite";

export default defineConfig({ 
  // Base path for GitHub Pages deployment
  // Uses relative paths (./) for deployment at root of custom domain or username.github.io/repo
  base: './',
  
  server: { 
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  }
