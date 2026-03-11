import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Compression (.gz / .br) is handled automatically by Vercel's CDN edge
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
        },
      },
    },
  },
});
