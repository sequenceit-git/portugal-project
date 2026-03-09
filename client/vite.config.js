import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Pre-compress with Brotli — served by most CDNs/hosts automatically
    compression({ algorithm: "brotliCompress", ext: ".br", threshold: 1024 }),
    // Also gzip for older servers
    compression({ algorithm: "gzip", ext: ".gz", threshold: 1024 }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 600,
    // Minify with esbuild (default, fastest)
    minify: "esbuild",
    // Split CSS per chunk so pages only load what they need
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, gets long-lived cache
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Supabase SDK
          "vendor-supabase": ["@supabase/supabase-js"],
          // Helmet
          "vendor-helmet": ["react-helmet-async"],
          // MapLibre GL — only loaded on the /map route
          "vendor-maplibre": ["maplibre-gl"],
        },
      },
    },
  },
});
