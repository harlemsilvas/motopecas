// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/motopecas/" : "/",
  plugins: [react()],
  server: {
    port: 5173, // Porta do Vite
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Backend
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
}));
