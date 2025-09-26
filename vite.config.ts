import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": { target: "http://localhost:7770", changeOrigin: true },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          mantineCharts: ["@mantine/charts"],
        },
      },
    },
  },
});
