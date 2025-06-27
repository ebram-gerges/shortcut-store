import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      // '/static': 'http://localhost:8001', // Uncomment if you need static proxy
    },
  },
  // Removed lucide-react from optimizeDeps.exclude to fix icon loading
  // To set the API base URL for the frontend, use a .env file with:
  // VITE_API_BASE_URL=http://localhost:8000
});
