export const PLACEHOLDER_LOGO = "/images/placeholder.svg";

export interface LogoApiEnv {
  BRANDFETCH_CLIENT_ID?: string;
  LOGO_DEV_PUBLIC?: string;
}

export function getDomainFromWebsite(website?: string | null): string | null {
  if (!website) return null;

  try {
    const url = new URL(website);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return hostname || null;
  } catch {
    return null;
  }
}

function appendParams(url: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
}

export function getSoftwareLogoCandidates(
  website?: string | null,
  env: LogoApiEnv = {},
): string[] {
  const domain = getDomainFromWebsite(website);
  if (!domain) return [];

  const encodedDomain = encodeURIComponent(domain);
  const candidates: string[] = [];
  const brandfetchClientId = env.BRANDFETCH_CLIENT_ID?.trim();
  const logoDevToken = env.LOGO_DEV_PUBLIC?.trim();

  if (brandfetchClientId) {
    for (const type of ["symbol", "logo", "icon"]) {
      candidates.push(
        appendParams(
          `https://cdn.brandfetch.io/domain/${encodedDomain}/fallback/404/type/${type}`,
          { c: brandfetchClientId },
        ),
      );
    }
  }

  if (logoDevToken) {
    candidates.push(
      appendParams(`https://img.logo.dev/${encodedDomain}`, {
        token: logoDevToken,
        size: "256",
        format: "png",
        retina: "true",
        fallback: "404",
      }),
    );
  }

  return candidates;
}
