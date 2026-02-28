import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import type { IconType } from "react-icons";
import {
  RiCheckDoubleLine,
  RiFileList3Line,
  RiGitPullRequestLine,
  RiShieldCheckLine,
  RiStackLine,
} from "react-icons/ri";
import Layout from "~/components/Layout";
import SubmitCTA from "~/components/SubmitCTA";
import { buildSocialMeta } from "~/lib/meta";

interface MandatoryCriterion {
  title: string;
  description: string;
  checks: string[];
  icon: IconType;
}

const mandatoryCriteria: MandatoryCriterion[] = [
  {
    title: "European development roots",
    description:
      "The core product team and strategic decision-making should be materially based in Europe.",
    checks: [
      "Company headquarters or principal team in a European country",
      "For open-source projects, sustained European maintainership",
      "Evidence that primary roadmap ownership remains in Europe",
    ],
    icon: RiStackLine,
  },
  {
    title: "Product quality and reliability",
    description:
      "Listings should reflect software that users can reasonably trust in production settings.",
    checks: [
      "Active maintenance and visible update activity",
      "Clear documentation for adoption and support",
      "No malware, abuse patterns, or deceptive distribution behavior",
    ],
    icon: RiFileList3Line,
  },
  {
    title: "Values and regulatory alignment",
    description:
      "Products should align with European expectations on privacy, security, and responsible data use.",
    checks: [
      "Transparent handling of personal and operational data",
      "Reasonable pathway to GDPR-compliant operation where relevant",
      "Respect for user autonomy and interoperable workflows",
    ],
    icon: RiShieldCheckLine,
  },
];

const reviewWorkflow = [
  {
    title: "Screening",
    description:
      "We verify submission completeness and basic eligibility before deeper evaluation.",
  },
  {
    title: "Verification",
    description:
      "We validate origin claims, ownership signals, and publicly available product context.",
  },
  {
    title: "Assessment",
    description:
      "We assess quality, maintenance posture, transparency, and user-facing trust indicators.",
  },
  {
    title: "Publication",
    description:
      "Accepted software is published and can be updated over time as the product evolves.",
  },
];

const preferredSignals = [
  "Open-source or transparent source availability",
  "Accessibility-minded product design",
  "Multi-language support for European markets",
  "Clear incident and security communication practices",
  "Independent audits or strong technical documentation",
];

export const meta: MetaFunction = () => {
  return buildSocialMeta({
    title: "Criteria - EuroMakers",
    description:
      "Understand the qualification standards and review workflow used to include software in the EuroMakers directory.",
    path: "/criteria",
  });
};

export default function CriteriaPage() {
  return (
    <Layout>
      <main>
        <section className="relative overflow-hidden bg-euBlue">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),transparent_45%)]"
          />
          <div className="eu-container relative max-w-6xl py-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-euYellow animate-fade-in">
              Inclusion Standards
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-white animate-fade-in-up md:text-6xl">
              A transparent model for qualifying European software.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/90 animate-fade-in-up animation-delay-200">
              EuroMakers applies clear standards so listings remain reliable for
              users and fair to builders. Criteria are intentionally practical:
              strong roots in Europe, product quality, and alignment with
              values that matter in European digital policy and operations.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/submit"
                className="btn btn-lg bg-white hover:bg-gray-100 text-euBlue shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                Submit Software
              </Link>
              <Link
                to="/about"
                className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
              >
                About EuroMakers
              </Link>
            </div>
          </div>
        </section>

        <section className="eu-section bg-gradient-to-b from-gray-50 to-white">
          <div className="eu-container max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-3">
            {mandatoryCriteria.map((criterion) => {
              const Icon = criterion.icon;

              return (
                <article
                  key={criterion.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-euBlue/10 text-euBlue">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {criterion.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {criterion.description}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {criterion.checks.map((check) => (
                      <li key={check} className="flex items-start gap-2">
                        <RiCheckDoubleLine
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-euBlue"
                        />
                        <span className="text-sm leading-relaxed text-gray-700">
                          {check}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-white pb-16">
          <div className="eu-container max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
            <article className="rounded-xl border border-gray-100 bg-white p-7 shadow-md md:p-9">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-euBlue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-euBlue">
                <RiGitPullRequestLine className="h-4 w-4 text-euBlue" />
                Review Workflow
              </div>

              <ol className="space-y-4">
                {reviewWorkflow.map((step, index) => (
                  <li
                    key={step.title}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-euBlue text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <aside className="rounded-xl border border-gray-100 bg-white p-7 shadow-md md:p-9">
              <h2 className="text-3xl font-bold text-gray-800">
                Preferred signals
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                These are not strict requirements, but they strengthen the case
                for inclusion.
              </p>

              <ul className="mt-6 space-y-3">
                {preferredSignals.map((signal) => (
                  <li key={signal} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="text-sm text-gray-700">{signal}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-euBlue">
                  Need help before submitting?
                </p>
                <Link
                  to="/contact"
                  className="mt-2 inline-flex text-sm font-semibold text-euBlue hover:text-blue-700"
                >
                  Contact the EuroMakers team
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <SubmitCTA />
    </Layout>
  );
}
