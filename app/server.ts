import { logDevReady } from "@remix-run/cloudflare";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";
import type { ServerBuild } from "@remix-run/server-runtime";

const serverBuild = build as unknown as ServerBuild;
const canonicalHost = "euromakers.org";
const legacyHosts = new Set(["euromakers.co", "www.euromakers.co"]);

if (process.env.NODE_ENV === "development") {
  logDevReady(serverBuild);
}

const pagesHandler = createPagesFunctionHandler({
  build: serverBuild,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env,
});

export const onRequest: typeof pagesHandler = async (context) => {
  const requestUrl = new URL(context.request.url);

  if (legacyHosts.has(requestUrl.hostname)) {
    requestUrl.hostname = canonicalHost;
    return Response.redirect(requestUrl.toString(), 301);
  }

  return pagesHandler(context);
};
