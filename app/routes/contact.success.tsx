import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Layout from "~/components/Layout";
import { buildSocialMeta } from "~/lib/meta";

export const meta: MetaFunction = () => [
  ...buildSocialMeta({
    title: "Message Sent - EuroMakers",
    description:
      "Your message has been sent to the EuroMakers team. We will reply as soon as possible.",
    path: "/contact/success",
  }),
  { name: "robots", content: "noindex, nofollow" },
];

export default function ContactSuccessPage() {
  return (
    <Layout>
      <main className="overflow-x-hidden w-full">
        <section className="eu-section bg-gradient-to-b from-euBlue/10 to-white">
          <div className="eu-container max-w-3xl px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
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
              </div>

              <h1 className="text-3xl font-bold mb-4 text-gray-800">
                Message Sent Successfully!
              </h1>

              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Thank you for contacting us. We have received your message and
                will get back to you as soon as possible.
              </p>

              <Link
                to="/"
                className="btn btn-primary bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white border-none"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
