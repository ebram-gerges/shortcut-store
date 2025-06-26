import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://192.168.1.4:8000',
      '/static': 'http://192.168.1.4:8001',
    },
  },
  // Removed lucide-react from optimizeDeps.exclude to fix icon loading
  // To set the API base URL for the frontend, use a .env file with:
  // VITE_API_BASE_URL=http://192.168.1.4:8000
});
