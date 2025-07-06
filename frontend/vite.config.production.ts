import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Production build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'terser',
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-hot-toast'],
          utils: ['axios', 'clsx', 'tailwind-merge']
        }
      }
    },
    
    // Optimize build size
    chunkSizeWarningLimit: 1000,
    
    // Asset optimization
    assetsInlineLimit: 4096,
  },
  
  // Base path for production
  base: '/',
  
  // Define global constants
  define: {
    __DEV__: false,
    __PROD__: true,
  },
  
  // Production server configuration (for preview)
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion'
    ]
  },
  
  // Production environment variables
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    modules: {
      generateScopedName: '[hash:base64:8]', // Shorter class names in production
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Security headers
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    }
  }
});