import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pwa } from "./pwa-plugin.js";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const proxy = {
  "/api": { target: process.env.API_PROXY_TARGET || "http://127.0.0.1:8000", changeOrigin: true },
};
export default defineConfig({
  plugins: [react(), pwa(root)],
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 4173, strictPort: true, proxy },
});
