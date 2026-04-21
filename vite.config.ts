import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2023',
    chunkSizeWarningLimit: 950,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-three/fiber')) {
            return 'react-three-fiber';
          }
          if (id.includes('/three/') || id.includes('node_modules/three/')) {
            return 'three';
          }
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
        },
      },
    },
  },
})
