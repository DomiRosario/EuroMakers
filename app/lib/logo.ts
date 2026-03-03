import type { SyntheticEvent } from "react";

const PLACEHOLDER_LOGO = "/images/placeholder.svg";

function isPlaceholderLogo(logo?: string | null): boolean {
  const normalized = (logo || "").trim();
  return normalized.length === 0 || normalized === PLACEHOLDER_LOGO;
}

function getFaviconUrlFromWebsite(website?: string | null): string | null {
  if (!website) return null;

  try {
    const url = new URL(website);
    if (!url.hostname) return null;

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=256`;
  } catch {
    return null;
  }
}

export function getSoftwareLogoUrl(logo?: string, website?: string): string {
  if (!isPlaceholderLogo(logo)) return (logo as string).trim();
  return getFaviconUrlFromWebsite(website) || PLACEHOLDER_LOGO;
}

export function handleLogoLoadError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.src.endsWith(PLACEHOLDER_LOGO)) return;
  image.onerror = null;
  image.src = PLACEHOLDER_LOGO;
}
