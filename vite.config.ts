import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/sudoku-claude-poc/" : "/",
  plugins: [reactRouter(), tsconfigPaths()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  build: {
    target: "esnext",
  },
  ssr: {
    // Bundle MUI packages for SSR/prerendering to avoid ESM directory import issues
    noExternal: [
      "@mui/material",
      "@mui/utils",
      "@mui/system",
      "@mui/styled-engine",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
    ],
  },
});
