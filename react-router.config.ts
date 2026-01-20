import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode - no server-side rendering
  ssr: false,
  // Use 'app' as the app directory
  appDirectory: "app",
  // Prerender the root route to generate index.html for static hosting
  prerender: ["/"],
  // Base path for GitHub Pages deployment (must match Vite's base config)
  basename: process.env.GITHUB_ACTIONS ? "/sudoku-claude-poc/" : "/",
} satisfies Config;
