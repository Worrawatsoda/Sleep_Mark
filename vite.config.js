import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Web Bluetooth works on localhost without HTTPS.
    // For production deployment, HTTPS is required.
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ['react', 'react-dom'],
          recharts: ['recharts'],
        },
      },
    },
  },
})
