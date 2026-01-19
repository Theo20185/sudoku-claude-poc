import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode - no server-side rendering
  ssr: false,
  // Use 'app' as the app directory
  appDirectory: "app",
} satisfies Config;
