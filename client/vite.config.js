import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxies /api requests to the Express server during local development
// so the React app can just call fetch('/api/...') without worrying
// about CORS or hardcoding a port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
