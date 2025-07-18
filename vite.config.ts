import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  // build: {
  //   outDir: "dist",
  // },

  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue"],
        },
      },
    },
  },

  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5430,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      // 인증 API 프록시
      "/api": {
        target: "http://192.168.233.128:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
