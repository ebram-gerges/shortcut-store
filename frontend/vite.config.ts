import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
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
=======
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
>>>>>>> 10c57fdec293134f4372ab8fbccf5f1baa226be5
