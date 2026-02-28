const SITE_URL = "https://euromakers.org";
const DEFAULT_OG_IMAGE_PATH = "/og-image.jpg";
const SITE_NAME = "EuroMakers";

const normalizePath = (path: string) => {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
};

const normalizeDescription = (description: string) => {
  return description.replace(/\s+/g, " ").trim();
};

export interface SocialMetaOptions {
  title: string;
  description: string;
  path?: string;
  imagePath?: string;
  type?: "website" | "article";
}

export function buildSocialMeta({
  title,
  description,
  path = "/",
  imagePath = DEFAULT_OG_IMAGE_PATH,
  type = "website",
}: SocialMetaOptions) {
  const normalizedPath = normalizePath(path);
  const pageUrl = new URL(normalizedPath, SITE_URL).toString();
  const imageUrl = new URL(imagePath, SITE_URL).toString();
  const cleanDescription = normalizeDescription(description);

  return [
    { title },
    { name: "description", content: cleanDescription },
    { property: "og:title", content: title },
    { property: "og:description", content: cleanDescription },
    { property: "og:type", content: type },
    { property: "og:url", content: pageUrl },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    {
      property: "og:image:alt",
      content: "EuroMakers banner highlighting European software discovery",
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: cleanDescription },
    { name: "twitter:image", content: imageUrl },
    {
      name: "twitter:image:alt",
      content: "EuroMakers banner highlighting European software discovery",
    },
  ];
}

export const DEFAULT_HOME_TITLE = "EuroMakers - European Software Directory";
export const DEFAULT_HOME_DESCRIPTION =
  "Discover and explore software built in Europe. EuroMakers helps teams find trusted European alternatives and strengthen digital sovereignty.";
