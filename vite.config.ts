import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // When used as Express middleware, the server config is managed by Express.
  // For standalone dev (npm run dev:frontend), keep the proxy.
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
