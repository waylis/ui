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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/]react/,
              priority: 2,
            },
            {
              name: "recharts",
              test: /node_modules[\\/]recharts/,
              priority: 1,
            },
          ],
        },
      },
    },
  },
});
