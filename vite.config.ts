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
      '/api': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/eztv': {
        target: 'https://eztv.wf/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eztv/, ''),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://eztv.wf'
        },
        timeout: 10000
      },
      '/torrentio': {
        target: 'https://torrentio.strem.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/torrentio/, '/stream'),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/json',
          'Origin': 'https://torrentio.strem.fun'
        },
        timeout: 10000
      }
    },
    watch: {
      usePolling: true,
    },
  },
  base: '/',
})
