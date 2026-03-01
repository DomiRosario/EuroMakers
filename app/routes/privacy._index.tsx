import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/Layout";
import { buildSocialMeta } from "~/lib/meta";

export const meta: MetaFunction = () => {
  return buildSocialMeta({
    title: "Privacy Policy - EuroMakers",
    description:
      "Privacy policy explaining what data EuroMakers collects, why it is processed, and your rights.",
    path: "/privacy",
  });
};

export default function PrivacyPage() {
  return (
    <Layout>
      <main>
        <section className="eu-section bg-gradient-to-b from-euBlue/10 to-white">
          <div className="eu-container max-w-4xl">
            <div className="page-header-section text-center mb-10">
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                How EuroMakers collects, uses, and protects data submitted
                through this website.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-10 space-y-7 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">Scope</h2>
                <p>
                  This policy applies to data processed through EuroMakers forms,
                  including software submissions, update reports, and contact
                  messages.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  Data We Collect
                </h2>
                <p>
                  Depending on the form, this can include software details,
                  evidence links, your name, email address, and free-text
                  messages. We also process anti-spam verification data from
                  Cloudflare Turnstile.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  How We Use Data
                </h2>
                <p>
                  We use data to review submissions, investigate updates or
                  reports, prevent abuse, and respond to messages. Submission
                  and moderation metadata may be stored in GitHub issues to keep
                  a transparent review history.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  Third-Party Processors
                </h2>
                <p>
                  We use service providers to operate the platform, including
                  Cloudflare Turnstile for anti-spam checks and GitHub for
                  moderation workflows. These providers process only the data
                  needed to deliver their service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  Public and Private Data
                </h2>
                <p>
                  We avoid publishing personal contact data in public moderation
                  records. Contact details are used privately by maintainers only
                  for moderation or reply purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  Data Retention
                </h2>
                <p>
                  We keep records only as long as needed for moderation,
                  operational integrity, legal compliance, and basic auditing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  Your Rights
                </h2>
                <p>
                  You can request clarification, correction, or deletion of your
                  personal data when applicable. For requests, use the contact
                  page or email contact@euromakers.org.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-2 text-euBlue">
                  Contact
                </h2>
                <p>
                  If you have privacy questions, contact
                  {" "}
                  <a
                    href="mailto:contact@euromakers.org"
                    className="text-euBlue hover:underline"
                  >
                    contact@euromakers.org
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
