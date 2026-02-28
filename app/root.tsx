import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Analytics } from "@vercel/analytics/remix";
import { SpeedInsights } from "@vercel/speed-insights/remix";
import MaintenanceWrapper from "./components/MaintenanceWrapper";
import Footer from "./components/Footer";
import { getEnvVars, getPublicEnvVars } from "./env.server";
import {
  buildSocialMeta,
  DEFAULT_HOME_DESCRIPTION,
  DEFAULT_HOME_TITLE,
} from "./lib/meta";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    ...buildSocialMeta({
      title: DEFAULT_HOME_TITLE,
      description: DEFAULT_HOME_DESCRIPTION,
      path: "/",
    }),
    { name: "author", content: "EuroMakers" },
    { name: "color-scheme", content: "light" },
    { name: "theme-color", content: "#1E40AF" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    { name: "format-detection", content: "telephone=no" },
    {
      name: "keywords",
      content:
        "european software, made in europe, software directory, digital sovereignty, european tech",
    },
    { name: "robots", content: "index, follow" },
    { name: "googlebot", content: "index, follow" },
    { name: "revisit-after", content: "7 days" },
    { name: "msapplication-TileColor", content: "#1E40AF" },
    { name: "msapplication-config", content: "/browserconfig.xml" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "/Euro-Makers-icon.png",
    type: "image/png",
  },
  {
    rel: "apple-touch-icon",
    href: "/Euro-Makers-icon.png",
  },
];

export async function loader() {
  const env = getEnvVars();
  const publicEnv = getPublicEnvVars();
  const isMaintenanceMode = env.MAINTENANCE_MODE === "true";

  return {
    isMaintenanceMode,
    ENV: publicEnv,
  };
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en" data-theme="euromakers">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans min-h-screen flex flex-col"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {isRouteErrorResponse(error)
                ? `${error.status} ${error.statusText}`
                : "Application Error"}
            </h1>
            <p className="text-gray-600">
              {isRouteErrorResponse(error)
                ? error.data
                : "Sorry, something went wrong. Please try again later."}
            </p>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en" data-theme="euromakers">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)};`, // skipcq: JS-P1003
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: DEFAULT_HOME_TITLE,
              description: DEFAULT_HOME_DESCRIPTION,
              url: "https://euromakers.org",
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans">
        <MaintenanceWrapper isMaintenanceMode={data.isMaintenanceMode}>
          <div className="flex flex-col min-h-screen">
            <Outlet />
            <Footer />
          </div>
        </MaintenanceWrapper>
        <ScrollRestoration />
        <Analytics />
        <SpeedInsights />
        <Scripts />
      </body>
    </html>
  );
}
