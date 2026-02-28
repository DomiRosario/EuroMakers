import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
import { buildSocialMeta } from "~/lib/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return json({ ticket: url.searchParams.get("ticket") });
}

export const meta: MetaFunction = () => [
  ...buildSocialMeta({
    title: "Submission Received - EuroMakers",
    description:
      "Your software submission was received and is now in moderation review.",
    path: "/submit/success",
  }),
  { name: "robots", content: "noindex, nofollow" },
];

export default function SubmitSuccessPage() {
  const { ticket } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <main className="w-full overflow-x-hidden">
        <section className="eu-section bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_rgba(255,255,255,0.85)_45%,_white_80%)]">
          <div className="eu-container max-w-4xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-8 text-center md:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-white">
                  <svg
                    className="h-8 w-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                  Submission Received
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Your software has entered the moderation pipeline. We now verify
                  data quality, evidence links, and European origin before publication.
                </p>
              </div>

              <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.3fr_1fr] md:px-10">
                <div className="space-y-5">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Moderation ticket
                    </p>
                    <p className="mt-1 text-lg font-bold text-blue-900">
                      {ticket ? `#${ticket}` : "Created successfully"}
                    </p>
                    <p className="mt-1 text-sm text-blue-800">
                      Keep this ticket ID if you need to follow up with the team.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h2 className="text-base font-semibold text-gray-900">What happens next</h2>
                    <ol className="mt-3 space-y-3 text-sm text-gray-700">
                      <li>
                        <span className="font-semibold text-gray-900">1.</span>{" "}
                        Automated checks validate format, evidence, and spam risk.
                      </li>
                      <li>
                        <span className="font-semibold text-gray-900">2.</span>{" "}
                        High-confidence submissions are merged automatically.
                      </li>
                      <li>
                        <span className="font-semibold text-gray-900">3.</span>{" "}
                        Borderline cases are queued for manual moderator review.
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h2 className="text-base font-semibold text-gray-900">Next actions</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    You can continue exploring the directory or submit another software entry.
                  </p>
                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      to="/software"
                      className="btn border-0 bg-euBlue text-white hover:bg-blue-700"
                    >
                      Browse software
                    </Link>
                    <Link to="/submit" className="btn btn-outline">
                      Submit another
                    </Link>
                    <Link to="/" className="btn btn-ghost text-gray-700">
                      Return home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
