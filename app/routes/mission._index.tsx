import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import type { IconType } from "react-icons";
import {
  RiArrowRightUpLine,
  RiCheckboxCircleLine,
  RiRocketLine,
  RiSearchEyeLine,
  RiShieldCheckLine,
  RiTeamLine,
} from "react-icons/ri";
import Layout from "~/components/Layout";
import { buildSocialMeta } from "~/lib/meta";

interface MissionPillar {
  title: string;
  description: string;
  icon: IconType;
}

const missionPillars: MissionPillar[] = [
  {
    title: "Increase visibility",
    description:
      "Surface outstanding European products that are often overshadowed in global software discovery channels.",
    icon: RiSearchEyeLine,
  },
  {
    title: "Strengthen trust",
    description:
      "Promote software grounded in privacy, security, and transparent operational standards.",
    icon: RiShieldCheckLine,
  },
  {
    title: "Support builders",
    description:
      "Give European teams a channel to reach more users and decision-makers across sectors.",
    icon: RiTeamLine,
  },
  {
    title: "Accelerate adoption",
    description:
      "Help organizations confidently transition toward resilient and compliant European alternatives.",
    icon: RiRocketLine,
  },
];

const deliveryActions = [
  {
    title: "Curated directory operations",
    description:
      "Each listing is reviewed for European development roots, maintenance quality, and product legitimacy.",
  },
  {
    title: "Clear qualification criteria",
    description:
      "We publish transparent inclusion standards so submissions are evaluated consistently and openly.",
  },
  {
    title: "Community-led expansion",
    description:
      "Developers and users help continuously improve coverage by submitting, updating, and validating entries.",
  },
  {
    title: "Practical awareness building",
    description:
      "We provide context for why procurement and tooling choices influence long-term digital sovereignty.",
  },
];

export const meta: MetaFunction = () => {
  return buildSocialMeta({
    title: "Our Mission - EuroMakers",
    description:
      "Understand how EuroMakers advances European digital sovereignty by improving software discovery, trust, and adoption.",
    path: "/mission",
  });
};

export default function MissionPage() {
  return (
    <Layout>
      <main>
        <section className="relative overflow-hidden bg-euBlue">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),transparent_45%)]"
          />
          <div className="eu-container relative max-w-6xl py-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-euYellow animate-fade-in">
              Mission Framework
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-white animate-fade-in-up md:text-6xl">
              A practical path toward European digital sovereignty.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/90 animate-fade-in-up animation-delay-200">
              EuroMakers exists to make European software easier to discover,
              evaluate, and adopt. Our mission is not symbolic. It is an
              operational effort to strengthen Europe&apos;s software economy
              and reduce structural dependency.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Focus
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Software built in Europe
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Outcome
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Better procurement confidence
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Horizon
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Long-term ecosystem resilience
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="eu-section bg-gradient-to-b from-gray-50 to-white">
          <div className="eu-container max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-2">
            {missionPillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  key={pillar.title}
                  className="rounded-xl border border-gray-100 bg-white p-7 shadow-md"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-euBlue/10 text-euBlue">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-white pb-16 md:pb-24">
          <div className="eu-container max-w-6xl rounded-xl border border-gray-100 bg-white p-8 shadow-md md:p-10">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-euBlue">
                  Execution Model
                </p>
                <h2 className="mt-3 text-3xl font-bold text-gray-800 md:text-4xl">
                  How we deliver this mission
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
                We combine clear standards, rigorous review, and active
                community collaboration to keep the directory useful and
                credible.
              </p>
            </div>

            <div className="space-y-4">
              {deliveryActions.map((action, index) => (
                <div
                  key={action.title}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-euBlue text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <RiCheckboxCircleLine className="h-5 w-5 text-euBlue" />
                <p className="text-sm text-gray-700">
                  Independent review mindset
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <RiCheckboxCircleLine className="h-5 w-5 text-euBlue" />
                <p className="text-sm text-gray-700">
                  Transparent inclusion criteria
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <RiCheckboxCircleLine className="h-5 w-5 text-euBlue" />
                <p className="text-sm text-gray-700">
                  Community participation loop
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/software"
                className="btn btn-eu flex-1"
              >
                Explore Software
                <RiArrowRightUpLine className="h-4 w-4" />
              </Link>
              <Link
                to="/submit"
                className="btn btn-eu-secondary flex-1"
              >
                Submit a Product
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
