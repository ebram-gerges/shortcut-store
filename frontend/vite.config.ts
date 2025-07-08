import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      // '/static': 'http://localhost:8001', // Uncomment if you need static proxy
    },
    host: '0.0.0.0', // Allow access from LAN
    // allowedHosts: ['1b35-196-131-168-107.ngrok-free.app'], // Remove ngrok for local
  },
  // Use import.meta.env.VITE_API_BASE_URL for all API calls in the frontend
});
