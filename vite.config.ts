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
    port: parseInt(process.env.VITE_VIEW_PORT || "5430"),
    open: true,
    cors: true,
    sourcemapIgnoreList: false,
    hmr: {
      overlay: true,
    },
    proxy: {
      // 인증 API 프록시
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // 개발 모드에서 소스맵 활성화
  esbuild: {
    sourcemap: true,
  },
});
