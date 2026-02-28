import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Layout from "~/components/Layout";
import { buildSocialMeta } from "~/lib/meta";

export const meta: MetaFunction = () => [
  ...buildSocialMeta({
    title: "Page Not Found - EuroMakers",
    description:
      "The page you were looking for does not exist. Browse European software listings on EuroMakers.",
    path: "/404",
  }),
  { name: "robots", content: "noindex, nofollow" },
];

export default function NotFound() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-euBlue mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            The page you are looking for might have been removed or is
            temporarily unavailable.
          </p>
          <Link
            to="/"
            className="btn bg-euBlue text-white hover:bg-blue-700 px-6 py-2"
          >
            Return Home
          </Link>
        </div>
        <div className="mt-8">
          <img
            src="/Euro-Makers.png"
            alt="EuroMakers Logo"
            className="w-24 h-24 opacity-50 mx-auto"
          />
        </div>
      </div>
    </Layout>
  );
}
