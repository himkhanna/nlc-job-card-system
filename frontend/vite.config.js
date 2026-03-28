import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('jspdf') || id.includes('papaparse'))  return 'vendor-pdf'
          if (id.includes('node_modules'))                        return 'vendor'
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5144',
        changeOrigin: true,
      },
      '/openapi': {
        target: 'http://localhost:5144',
        changeOrigin: true,
      },
    },
  },
})
