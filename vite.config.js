import path from "path"
import tailwindcss from "@tailwindcss/vite"
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
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype')) {
            return 'ui-vendor';
          }
          // Data modules
          if (id.includes('/src/data/')) {
            return 'data';
          }
          // Context modules
          if (id.includes('/src/contexts/')) {
            return 'contexts';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // Smaller chunks for better caching
    chunkSizeWarningLimit: 1000,
    // Minify & optimize
    minify: 'esbuild', // เร็วกว่า terser
    target: 'es2015', // Support modern browsers
    // Optimize CSS
    cssCodeSplit: true
  },
  // Faster dev server
  server: {
    hmr: {
      overlay: false, // ปิด error overlay เพื่อความเร็ว
    }
  }
})