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
import { getSoftwareContentBlocks } from "~/lib/software-content";
import SoftwareLogo from "~/components/SoftwareLogo";

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

// ── Similarity helpers ──────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "is","are","was","were","be","been","have","has","had","do","does","did",
  "will","would","could","should","may","might","can","that","this","it","its",
  "your","our","their","all","any","more","most","other","some","no","not",
  "only","so","than","too","very","just","from","up","about","as","if","you",
  "we","they","he","she","also","use","used","using","allows","provides",
  "enables","support","supports","help","helps","make","makes","get","getting",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

function scoreSimilarity(target: Software, candidate: Software): number {
  // Category match — strongest signal
  const categoryScore = candidate.categoryId === target.categoryId ? 4 : 0;

  // Feature overlap — Jaccard on all feature tokens combined
  const targetFeatures = new Set(
    target.features.flatMap((f) => [...tokenize(f)]),
  );
  const candidateFeatures = new Set(
    candidate.features.flatMap((f) => [...tokenize(f)]),
  );
  const featureScore = jaccard(targetFeatures, candidateFeatures) * 3;

  // Short description overlap
  const targetDesc = tokenize(target.description);
  const candidateDesc = tokenize(candidate.description);
  const descScore = jaccard(targetDesc, candidateDesc) * 2;

  // Long description overlap
  const targetLong = tokenize(target.longDescription);
  const candidateLong = tokenize(candidate.longDescription);
  const longDescScore = jaccard(targetLong, candidateLong) * 1.5;

  // Same country — minor bonus
  const countryScore = candidate.country === target.country ? 0.5 : 0;

  return categoryScore + featureScore + descScore + longDescScore + countryScore;
}

// ───────────────────────────────────────────────────────────────────────────

export async function loader({ params }: { params: { id: string } }) {
  const rawSoftware = await getSoftwareByIdServer(params.id);
  const software = rawSoftware ? mapRawSoftwareToSoftware(rawSoftware) : null;

  let relatedSoftware: Software[] = [];
  if (software) {
    const allRawSoftware = await getAllSoftwareServer();
    relatedSoftware = allRawSoftware
      .filter((s) => s.id !== software.id)
      .map(mapRawSoftwareToSoftware)
      .map((s) => ({ software: s, score: scoreSimilarity(software, s) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ software: s }) => s);
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

  const contentBlocks = getSoftwareContentBlocks(software.longDescription);

  return (
    <Layout>
      <main className="container mx-auto px-3 sm:px-4 py-6 md:py-10 max-w-6xl">

        {/* CSS grid: 1 col mobile → 2 col desktop [main | sidebar] */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem] gap-3 md:gap-6">

          {/* ── 1. Hero card — top-left desktop, first mobile ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 lg:p-8 lg:col-start-1 lg:row-start-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                <SoftwareLogo
                  website={software.website}
                  alt={`${software.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                    <span className="w-4 h-3 inline-flex flex-shrink-0">
                      {getFlagComponent(software.country)}
                    </span>
                    {software.country}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-xs font-medium text-euBlue">
                    {software.categoryDisplayName}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {software.name}
                </h1>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {software.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={software.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-eu px-4 py-2 inline-flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                Visit Website
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <Link
                to={`/update?software=${encodeURIComponent(software.id)}`}
                className="text-xs text-gray-400 hover:text-gray-600 hover:underline underline-offset-2 transition-colors"
              >
                Report inactivity or spam
              </Link>
            </div>
          </div>

          {/* ── 2. Features — right column spanning both rows desktop, SECOND on mobile ── */}
          {software.features.length > 0 && (
            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                <div className="px-4 py-3 md:px-5 md:py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 text-base">Features</h2>
                  <p className="text-xs text-gray-400 mt-0.5">What {software.name} offers</p>
                </div>
                <ul className="flex-1 divide-y divide-gray-50">
                  {software.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 px-4 py-2.5 md:px-5 md:py-3">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-euBlue">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-700 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── 3. Description — bottom-left desktop, THIRD on mobile ── */}
          {contentBlocks.length > 0 && (
            <div className="lg:col-start-1 lg:row-start-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-4 md:px-6 py-3 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">About</p>
                </div>
                <div className="px-4 md:px-6 py-4 space-y-3">
                  {contentBlocks.map((block, index) => {
                    if (block.type === "heading") {
                      return (
                        <h3 key={`${block.type}-${index}`} className="text-sm font-semibold text-gray-700 pt-1">
                          {block.text}
                        </h3>
                      );
                    }
                    if (block.type === "list") {
                      return (
                        <ul key={`${block.type}-${index}`} className="space-y-1 pl-4 list-disc marker:text-gray-300">
                          {block.items.map((item) => (
                            <li key={item} className="text-sm text-gray-500 leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={`${block.type}-${index}`} className="text-sm text-gray-500 leading-relaxed">
                        {block.text}
                      </p>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 px-4 md:px-6 py-3 flex items-center gap-2">
                  <div className="w-7 h-5 flex-shrink-0">{getFlagComponent("EU")}</div>
                  <p className="text-xs text-gray-400">Made in Europe — supporting European innovation and digital sovereignty</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Related Software ── */}
        {relatedSoftware.length > 0 && (
          <section className="mt-6 md:mt-10">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Similar software</h2>
            {/* Mobile: compact rectangle list. Desktop: card grid */}
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {relatedSoftware.map((item) => (
                <div key={item.id} className="sm:hidden">
                  <SoftwareCard
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    categoryDisplayName={item.categoryDisplayName}
                    country={item.country}
                    website={item.website}
                    viewMode="rectangles"
                  />
                </div>
              ))}
              {relatedSoftware.map((item) => (
                <div key={item.id} className="hidden sm:block">
                  <SoftwareCard
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    categoryDisplayName={item.categoryDisplayName}
                    country={item.country}
                    website={item.website}
                    viewMode="cards"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </Layout>
  );
}
