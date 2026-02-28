/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // Remove the browsing-topics from Permissions-Policy header if it exists
  const permissionsPolicy = responseHeaders.get("Permissions-Policy");
  if (permissionsPolicy) {
    const policies = permissionsPolicy
      .split(",")
      .filter((policy) => !policy.trim().startsWith("browsing-topics="));
    if (policies.length > 0) {
      responseHeaders.set("Permissions-Policy", policies.join(","));
    } else {
      responseHeaders.delete("Permissions-Policy");
    }
  }

  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onAllReady() {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          // Add Content Security Policy header
          responseHeaders.set(
            "Content-Security-Policy",
            [
              "default-src 'self';",
              "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com;",
              "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com;",
              "img-src 'self' data:;",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com;",
              "script-src-elem 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "frame-src 'self' https://challenges.cloudflare.com;",
              "frame-ancestors 'self' https://www.dominriq.dev https://dominriq.dev;",
            ].join(" ")
          );

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          // Add Content Security Policy header
          responseHeaders.set(
            "Content-Security-Policy",
            [
              "default-src 'self';",
              "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com;",
              "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com;",
              "img-src 'self' data:;",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com;",
              "script-src-elem 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "frame-src 'self' https://challenges.cloudflare.com;",
              "frame-ancestors 'self' https://www.dominriq.dev https://dominriq.dev;",
            ].join(" ")
          );

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
