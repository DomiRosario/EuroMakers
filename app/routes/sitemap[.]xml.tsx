import { LoaderFunction } from "@remix-run/node";
import { getAllSoftwareServer } from "~/lib/software.server";

export const loader: LoaderFunction = async () => {
  const software = await getAllSoftwareServer();
  const baseUrl = "https://euromakers.org";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/mission",
    "/software",
    "/submit",
    "/update",
    "/contact",
    "/privacy",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticRoutes
        .map(
          (route) => `
        <url>
          <loc>${baseUrl}${route}</loc>
          <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>
          <priority>${route === "" ? "1.0" : "0.8"}</priority>
        </url>
      `,
        )
        .join("")}
      ${software
        .map(
          (sw) => `
        <url>
          <loc>${baseUrl}/software/${sw.id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `,
        )
        .join("")}
    </urlset>
  `.trim();

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(sitemap)),
      "Cache-Control": "public, max-age=3600",
    },
  });
};
