import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-markdown'],
        }
      }
    },
    // Smaller chunks for better caching
    chunkSizeWarningLimit: 1000,
  },
  // Faster dev server
  server: {
    hmr: {
      overlay: false, // ปิด error overlay เพื่อความเร็ว
    }
  }
})