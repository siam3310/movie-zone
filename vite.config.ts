import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/tmdb': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
      },
      '/api/torrentio': {
        target: 'https://torrentio.strem.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/torrentio/, ''),
      },
      '/api/yts': {
        target: 'https://yts.mx/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yts/, ''),
      },
      '/api/eztv': {
        target: 'https://eztv.re/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eztv/, ''),
      },
      '/api/imdb': {
        target: 'https://v2.sg.media-imdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/imdb/, ''),
      }
    },
    watch: {
      usePolling: true,
    },
  },
  base: '/',
})
