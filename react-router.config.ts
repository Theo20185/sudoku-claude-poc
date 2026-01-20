import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode - no server-side rendering
  ssr: false,
  // Use 'app' as the app directory
  appDirectory: "app",
  // Prerender the root route to generate index.html for static hosting
  prerender: ["/"],
} satisfies Config;
