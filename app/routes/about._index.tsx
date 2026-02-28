import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import type { IconType } from "react-icons";
import {
  RiArrowRightUpLine,
  RiEarthLine,
  RiGroupLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import Layout from "~/components/Layout";
import { buildSocialMeta } from "~/lib/meta";

interface ValuePillar {
  title: string;
  description: string;
  icon: IconType;
}

const valuePillars: ValuePillar[] = [
  {
    title: "Digital Sovereignty",
    description:
      "We help organizations reduce dependency risk by surfacing credible alternatives built in Europe.",
    icon: RiEarthLine,
  },
  {
    title: "Trust by Design",
    description:
      "Privacy, transparency, and responsible data practices are central to how we evaluate software.",
    icon: RiShieldCheckLine,
  },
  {
    title: "Ecosystem Strength",
    description:
      "EuroMakers connects builders, operators, and buyers around a stronger European software market.",
    icon: RiGroupLine,
  },
];

const participationSteps = [
  {
    title: "Explore",
    description:
      "Use the directory to find well-matched European tools for your stack and procurement needs.",
  },
  {
    title: "Contribute",
    description:
      "Submit software that meets our standards so the catalog reflects the full breadth of European innovation.",
  },
  {
    title: "Advocate",
    description:
      "Share trusted European options within your company, public sector team, or community.",
  },
];

export const meta: MetaFunction = () => {
  return buildSocialMeta({
    title: "About EuroMakers - European Software Directory",
    description:
      "Learn why EuroMakers exists, how we define European software, and how we support a stronger European technology ecosystem.",
    path: "/about",
  });
};

export default function AboutPage() {
  return (
    <Layout>
      <main>
        <section className="relative overflow-hidden bg-euBlue">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),transparent_45%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40"
          />
          <div className="eu-container relative max-w-6xl py-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-euYellow animate-fade-in">
              About EuroMakers
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-white animate-fade-in-up md:text-6xl">
              Building a stronger European software commons.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/90 animate-fade-in-up animation-delay-200">
              EuroMakers is a public directory focused on software designed and
              developed in Europe. We make it easier for teams to discover
              credible products aligned with European standards on privacy,
              accountability, and long-term resilience.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">
                  Pan-European
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/80">
                  Discovery coverage
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">
                  Policy-Aware
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/80">
                  Privacy and compliance lens
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">
                  Community-Led
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/80">
                  Editorially reviewed submissions
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/software"
                className="btn btn-lg bg-white hover:bg-gray-100 text-euBlue shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                Browse Directory
                <RiArrowRightUpLine className="h-4 w-4" />
              </Link>
              <Link
                to="/mission"
                className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
              >
                Read Our Mission
              </Link>
            </div>
          </div>
        </section>

        <section className="eu-section bg-gradient-to-b from-gray-50 to-white">
          <div className="eu-container max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            <article className="rounded-xl border border-gray-100 bg-white p-8 shadow-md md:p-10">
              <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
                Why EuroMakers exists
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-700">
                Europe has world-class software talent, yet discovery still
                favors large global incumbents. EuroMakers addresses that gap by
                providing a focused index of products and teams with meaningful
                European roots.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                We consider software European when core product leadership and
                development are based in Europe, including companies
                headquartered in Europe and open-source projects with sustained
                European stewardship.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                The goal is practical: help organizations find high-quality
                software while reinforcing a competitive, resilient, and
                value-aligned digital economy in Europe.
              </p>
            </article>

            <aside className="space-y-4">
              {valuePillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <div
                    key={pillar.title}
                    className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-euBlue/10 text-euBlue">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </aside>
          </div>
        </section>

        <section className="bg-white pb-16 md:pb-24">
          <div className="eu-container max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
                How to participate
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
                EuroMakers grows through contributions from builders, operators,
                and advocates across Europe.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {participationSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-euBlue">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-gray-800">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
