import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
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
  const emptyChunkWarnings = ["sitemap_._xml", "api.software", "api.contact"];

  return {
    plugins: [
      remix({
        presets: [vercelPreset()],
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
      external: ["@remix-run/dev/server-build", "canvas"],
      noExternal: ["node:*"],
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === "EMPTY_BUNDLE" &&
            emptyChunkWarnings.some((chunkName) => warning.message.includes(chunkName))
          ) {
            return;
          }

          warn(warning);
        },
      },
    },
    define: {
      'process.env.MAINTENANCE_MODE': JSON.stringify(env.MAINTENANCE_MODE),
    }
  };
});
