import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
  },

  // build: {
  //   outDir: "dist",
  //   sourcemap: true,
  //   minify: "terser",
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         vendor: ["vue"],
  //       },
  //     },
  //   },
  // },

  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    },
  },
});
