import { useEffect, useState, type ImgHTMLAttributes } from "react";
import {
  getDomainFromWebsite,
  getSoftwareLogoCandidates,
  getSoftwareLogoProxyUrl,
  PLACEHOLDER_LOGO,
} from "~/lib/logo";

type SoftwareLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "onError"
> & {
  alt: string;
  website?: string | null;
};

const LOGO_CACHE_VERSION = "v1";
const LOGO_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getLogoCacheKey(website?: string | null) {
  const domain = getDomainFromWebsite(website);
  return domain ? `euromakers:logo:${LOGO_CACHE_VERSION}:${domain}` : null;
}

function getCachedLogoSrc(cacheKey: string | null, candidates: string[]) {
  if (!cacheKey) return null;

  try {
    const rawValue = window.localStorage.getItem(cacheKey);
    if (!rawValue) return null;

    const cached = JSON.parse(rawValue) as {
      src?: string;
      expiresAt?: number;
    };

    if (
      !cached.src ||
      !cached.expiresAt ||
      cached.expiresAt <= Date.now() ||
      !candidates.includes(cached.src)
    ) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return cached.src;
  } catch {
    return null;
  }
}

function setCachedLogoSrc(cacheKey: string | null, src: string) {
  if (!cacheKey || src === PLACEHOLDER_LOGO) return;

  try {
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({
        src,
        expiresAt: Date.now() + LOGO_CACHE_TTL_MS,
      }),
    );
  } catch {
    // Browsers may block storage in privacy modes; logos still work without it.
  }
}

export default function SoftwareLogo({
  alt,
  website,
  onLoad,
  style,
  ...imageProps
}: SoftwareLogoProps) {
  const [logoCandidates, setLogoCandidates] = useState<string[]>([]);
  const [logoIndex, setLogoIndex] = useState(0);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const cacheKey = getLogoCacheKey(website);

  useEffect(() => {
    const candidates = [
      ...getSoftwareLogoCandidates(website, {
        BRANDFETCH_CLIENT_ID: window.ENV?.BRANDFETCH_CLIENT_ID,
      }),
      getSoftwareLogoProxyUrl(website),
    ].filter((candidate): candidate is string => Boolean(candidate));

    const cachedSrc = getCachedLogoSrc(cacheKey, candidates);

    setLogoCandidates(candidates);
    setLogoIndex(cachedSrc ? candidates.indexOf(cachedSrc) : 0);
    setIsLogoLoaded(false);
  }, [cacheKey, website]);

  const logoSrc = logoCandidates[logoIndex] || PLACEHOLDER_LOGO;
  const isPlaceholderSrc = logoSrc === PLACEHOLDER_LOGO;

  return (
    <img
      {...imageProps}
      src={logoSrc}
      alt={alt}
      style={{
        ...(!isLogoLoaded && !isPlaceholderSrc
          ? {
              backgroundImage: `url("${PLACEHOLDER_LOGO}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }
          : {}),
        ...style,
      }}
      onLoad={(event) => {
        setIsLogoLoaded(true);
        setCachedLogoSrc(
          cacheKey,
          event.currentTarget.getAttribute("src") || event.currentTarget.src,
        );
        onLoad?.(event);
      }}
      onError={(event) => {
        if (event.currentTarget.src.endsWith(PLACEHOLDER_LOGO)) return;
        setIsLogoLoaded(false);
        if (logoIndex < logoCandidates.length - 1) {
          setLogoIndex((currentIndex) => currentIndex + 1);
          return;
        }
        event.currentTarget.src = PLACEHOLDER_LOGO;
      }}
    />
  );
}
