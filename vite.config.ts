import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    ssr: {
      external: ["@remix-run/dev/server-build"],
      noExternal: ["node:*"],
    },
    define: {
      'process.env.MAINTENANCE_MODE': JSON.stringify(env.MAINTENANCE_MODE),
      'process.env.CLOUDFLARE_TURNSTILE_SITE_KEY': JSON.stringify(env.CLOUDFLARE_TURNSTILE_SITE_KEY),
    }
  };
});
