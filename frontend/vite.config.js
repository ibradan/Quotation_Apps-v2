import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    open: true,
    // Performance optimizations
    hmr: {
      overlay: false // Disable error overlay for better performance
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    // Performance optimizations
    sourcemap: false, // Disable sourcemap for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          utils: ['axios', 'zod', 'react-hook-form'],
          pdf: ['jspdf', 'html2canvas', 'file-saver'],
          charts: ['chart.js', 'react-chartjs-2']
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    // Performance optimizations
    reportCompressedSize: false,
    cssCodeSplit: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', 'axios'],
    // Performance optimizations
    force: false
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  // Performance optimizations
  css: {
    devSourcemap: false
  },
  // Cache optimization
  cacheDir: '.vite'
})
