import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
import {
  getAllSoftwareServer,
  getSoftwareByIdServer,
} from "~/lib/software.server";
import type { Software } from "~/lib/software";
import SoftwareCard from "~/components/SoftwareCard";
import * as Flag from "country-flag-icons/react/3x2";
import { getCountryCode } from "~/lib/countries";
import { mapRawSoftwareToSoftware } from "~/lib/software";
import { buildSocialMeta } from "~/lib/meta";

// Kept local getFlagComponent
const getFlagComponent = (countryCode: string) => {
  const code = getCountryCode(countryCode);
  const flagMap = Flag as unknown as Record<
    string,
    React.ComponentType<{
      className?: string;
      title?: string;
    }>
  >;
  const FlagComponent = flagMap[code] as React.ComponentType<{
    className?: string;
    title?: string;
  }>;
  return FlagComponent ? (
    <FlagComponent className="w-full h-full" title={countryCode} />
  ) : null;
};

interface LoaderData {
  software: Software | null;
  relatedSoftware: Software[];
}

export async function loader({ params }: { params: { id: string } }) {
  // Fetch the main software item using the mapping function
  const rawSoftware = await getSoftwareByIdServer(params.id);
  const software = rawSoftware ? mapRawSoftwareToSoftware(rawSoftware) : null;

  // Load related software (same category)
  let relatedSoftware: Software[] = [];
  if (software) {
    const allRawSoftware = await getAllSoftwareServer();
    relatedSoftware = allRawSoftware
      .filter((s) => s.id !== software.id && s.category === software.categoryId)
      .slice(0, 2)
      .map(mapRawSoftwareToSoftware); // Map to Software type
  }

  return json<LoaderData>({ software, relatedSoftware });
}

export const meta: MetaFunction = ({ data, params }) => {
  const loaderData = data as LoaderData | undefined;
  const fallbackPath = params.id ? `/software/${params.id}` : "/software";

  if (!loaderData?.software) {
    return buildSocialMeta({
      title: "Software Listing Not Found | EuroMakers",
      description:
        "This software listing could not be found. Browse the EuroMakers directory for European alternatives.",
      path: fallbackPath,
    });
  }

  const { software } = loaderData;
  const title = `${software.name} | EuroMakers`;
  const description =
    software.description ||
    `${software.name} is a European software product listed on EuroMakers.`;

  return buildSocialMeta({
    title,
    description,
    path: `/software/${software.id}`,
  });
};

export default function SoftwareDetail() {
  const { software, relatedSoftware } = useLoaderData<LoaderData>();

  if (!software) {
    return (
      <Layout>
        <div className="bg-white">
          <main className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold mt-4 mb-2">
                Software not found
              </h1>
              <p className="text-gray-500 mb-6">
                The requested software could not be found.
              </p>
              <Link to="/software" className="btn-eu px-6 py-2">
                Browse all software
              </Link>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                <img
                  src={software.logo || "/images/placeholder.svg"}
                  alt={`${software.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                    <div className="w-5 h-4">
                      {getFlagComponent(software.country)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {software.country}
                    </span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                    {software.categoryDisplayName}
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {software.name}
                </h1>
                <p className="text-gray-600 mb-4">{software.description}</p>

                <a
                  href={software.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-eu px-5 py-2 inline-flex items-center gap-2"
                >
                  Visit Website
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>

                <div className="mt-4">
                  <Link
                    to={`/update?software=${encodeURIComponent(software.id)}`}
                    className="text-sm text-gray-600 hover:text-euBlue underline-offset-2 hover:underline"
                  >
                    Report inactivity or spam
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Long Description */}
          <div className="prose max-w-none mb-8 whitespace-pre-wrap">
            {software.longDescription}
          </div>

          {/* Features */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {software.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-euBlue flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {/* European Badge */}
          <div className="border-t border-gray-100 pt-6 flex items-center">
            <div className="w-10 h-6 mr-3">{getFlagComponent("EU")}</div>
            <p className="text-sm text-gray-600">
              Made in Europe – Supporting European innovation and digital
              sovereignty
            </p>
          </div>

          {/* Related Software */}
          {relatedSoftware.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Software</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedSoftware.map((item) => (
                  <SoftwareCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    categoryDisplayName={item.categoryDisplayName}
                    country={item.country}
                    logo={item.logo || "/images/placeholder.svg"}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </Layout>
  );
}
