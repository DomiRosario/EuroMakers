import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getEnvVars } from "~/env.server";
import {
  getSoftwareLogoCandidates,
  PLACEHOLDER_LOGO,
} from "~/lib/logo";

type CachedLogo =
  | {
      kind: "hit";
      body: ArrayBuffer;
      contentType: string;
      expiresAt: number;
    }
  | {
      kind: "miss";
      expiresAt: number;
    };

const MAX_LOGO_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 4000;
const SUCCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 24 * 60 * 60 * 1000;
const SUCCESS_CACHE_CONTROL =
  "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=604800";
const MISS_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

const logoCache = new Map<string, CachedLogo>();

function normalizeDomain(value?: string | null): string | null {
  if (!value) return null;

  try {
    const parsed = new URL(value.includes("://") ? value : `https://${value}`);
    const domain = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (!domain.includes(".") || !/^[a-z0-9.-]+$/.test(domain)) {
      return null;
    }

    return domain;
  } catch {
    return null;
  }
}

function getFreshCacheEntry(domain: string): CachedLogo | null {
  const cached = logoCache.get(domain);

  if (!cached) return null;
  if (cached.expiresAt > Date.now()) return cached;

  logoCache.delete(domain);
  return null;
}

async function fetchLogoCandidate(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "image/avif,image/webp,image/svg+xml,image/png,image/jpeg,*/*",
      },
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.toLowerCase().startsWith("image/")) return null;

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_LOGO_BYTES) return null;

    const body = await response.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_LOGO_BYTES) return null;

    return {
      body,
      contentType,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function redirectToPlaceholder(cacheControl = MISS_CACHE_CONTROL) {
  return redirect(PLACEHOLDER_LOGO, {
    headers: {
      "Cache-Control": cacheControl,
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const domain = normalizeDomain(url.searchParams.get("domain"));

  if (!domain) {
    return redirectToPlaceholder();
  }

  const cached = getFreshCacheEntry(domain);
  if (cached?.kind === "hit") {
    return new Response(cached.body, {
      headers: {
        "Cache-Control": SUCCESS_CACHE_CONTROL,
        "Content-Type": cached.contentType,
        "X-Logo-Cache": "HIT",
      },
    });
  }

  if (cached?.kind === "miss") {
    return redirectToPlaceholder();
  }

  const env = getEnvVars();
  const candidates = getSoftwareLogoCandidates(`https://${domain}`, {
    LOGO_DEV_PUBLIC: env.LOGO_DEV_PUBLIC,
  });

  for (const candidate of candidates) {
    const logo = await fetchLogoCandidate(candidate);

    if (logo) {
      logoCache.set(domain, {
        kind: "hit",
        body: logo.body,
        contentType: logo.contentType,
        expiresAt: Date.now() + SUCCESS_TTL_MS,
      });

      return new Response(logo.body, {
        headers: {
          "Cache-Control": SUCCESS_CACHE_CONTROL,
          "Content-Type": logo.contentType,
          "X-Logo-Cache": "MISS",
        },
      });
    }
  }

  logoCache.set(domain, {
    kind: "miss",
    expiresAt: Date.now() + MISS_TTL_MS,
  });

  return redirectToPlaceholder();
}
