import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ✅ สำหรับ React Router ให้ redirect ทุก path กลับ index.html
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    historyApiFallback: true, // 👈 สำคัญมาก
  },
  preview: {
    historyApiFallback: true, // 👈 สำหรับตอน build แล้ว preview
  },
});