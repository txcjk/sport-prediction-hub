import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy deps into separate chunks — loaded on demand
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'recharts'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor'
            }
          }
          return undefined
        },
      },
    },
  },
})
