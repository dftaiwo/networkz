import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = process.env.VITE_BACKEND_URL || "http://backend:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": { target: backend, changeOrigin: true },
      "/uploads": { target: backend, changeOrigin: true },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
