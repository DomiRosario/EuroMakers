import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
import { getAllSoftwareServer } from "~/lib/software.server";
import { applyRateLimit } from "~/utils/rate-limit.server";
import { handleAPIError } from "~/lib/api/server";
import { checkBotId } from "botid/server";
import { sanitizeEmail, sanitizeText, sanitizeUrl } from "~/utils/sanitize.server";
import {
  buildReportIssueBody,
  createGitHubIssue,
  maskEmail,
} from "~/lib/github-moderation.server";
import { getEnvVars } from "~/env.server";
import type { ReportPayload } from "~/lib/moderation.types";
import { sendEmail } from "~/utils/smtp2go.server";
import { buildSocialMeta } from "~/lib/meta";

interface LoaderData {
  software: Array<{ id: string; name: string }>;
}

interface ActionResponse {
  error?: string;
  success?: boolean;
  issueNumber?: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const software = await getAllSoftwareServer();
  const url = new URL(request.url);
  const preselectedSoftware = url.searchParams.get("software") || "";

  return json<LoaderData & { preselectedSoftware: string }>({
    software: software
      .map((item) => ({ id: item.id, name: item.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    preselectedSoftware,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await applyRateLimit(request, "software.report");

    const formData = await request.formData();
    const softwareId = sanitizeText(formData.get("softwareId") as string);
    const reason = sanitizeText(formData.get("reason") as string);
    const details = sanitizeText(formData.get("details") as string);
    const evidenceUrlRaw = formData.get("evidenceUrl") as string;
    const contactEmailRaw = formData.get("contactEmail") as string;
    const evidenceUrl = evidenceUrlRaw ? sanitizeUrl(evidenceUrlRaw) : "";
    const contactEmail = contactEmailRaw ? sanitizeEmail(contactEmailRaw) : "";
    const gdprConsent = formData.get("gdprConsent") === "on";

    if (!softwareId || !reason || !details || !gdprConsent) {
      return json<ActionResponse>(
        { error: "All required fields must be completed." },
        { status: 400 },
      );
    }

    if (details.length < 20 || details.length > 3000) {
      return json<ActionResponse>(
        { error: "Details must be between 20 and 3000 characters." },
        { status: 400 },
      );
    }

    if (evidenceUrlRaw && !evidenceUrl) {
      return json<ActionResponse>(
        { error: "Evidence URL must be a valid URL." },
        { status: 400 },
      );
    }

    if (contactEmailRaw && !contactEmail) {
      return json<ActionResponse>(
        { error: "Please enter a valid contact email or leave it blank." },
        { status: 400 },
      );
    }

    const normalizedReason =
      reason === "inactivity" || reason === "spam" ? reason : "other";

    const botCheck = await checkBotId();
    if (botCheck.isBot) {
      return json<ActionResponse>({ error: "Access denied" }, { status: 403 });
    }

    const payload: ReportPayload = {
      submissionType: "software-report",
      submittedAt: new Date().toISOString(),
      softwareId,
      reason: normalizedReason,
      details,
      ...(evidenceUrl ? { evidenceUrl } : {}),
      ...(contactEmail ? { contactEmailMasked: maskEmail(contactEmail) } : {}),
    };

    const env = getEnvVars();
    const issue = await createGitHubIssue({
      title: `Software report: ${softwareId} (${normalizedReason})`,
      body: buildReportIssueBody(payload),
      labels: [env.GITHUB_REPORT_LABEL || "report", `report:${normalizedReason}`],
    });

    if (contactEmail) {
      try {
        await sendEmail({
          to: process.env.CONTACT_EMAIL || "contact@euromakers.org",
          subject: `[Report #${issue.number}] ${softwareId} (${normalizedReason})`,
          text: [
            "Software report submitted",
            "",
            `Ticket: #${issue.number}`,
            `Software ID: ${softwareId}`,
            `Reason: ${normalizedReason}`,
            `Contact: ${contactEmail}`,
            evidenceUrl ? `Evidence URL: ${evidenceUrl}` : "Evidence URL: none",
            "",
            "Details:",
            details,
          ].join("\n"),
          replyTo: contactEmail,
        });
      } catch (emailError) {
        console.error("Report notification email failed:", emailError);
      }
    }

    return json<ActionResponse>({ success: true, issueNumber: issue.number });
  } catch (error) {
    return handleAPIError(error);
  }
}

export const meta: MetaFunction = () =>
  buildSocialMeta({
    title: "Report Software - EuroMakers",
    description:
      "Report inactive, spam, or low-quality listings in the EuroMakers directory for moderation review.",
    path: "/update",
  });

export default function UpdateSoftwarePage() {
  const { software, preselectedSoftware } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();

  return (
    <Layout>
      <main className="overflow-x-hidden w-full">
        <section className="eu-section bg-gradient-to-b from-euBlue/10 to-white">
          <div className="eu-container max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-3">Report Software</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Report software for inactivity, spam, or quality concerns. We create
                a moderation issue automatically for triage.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {actionData?.error && (
                <div className="p-4 bg-red-50 border-b border-red-100 text-red-600">
                  {actionData.error}
                </div>
              )}
              {actionData?.success && (
                <div className="p-4 bg-green-50 border-b border-green-100 text-green-700">
                  Report submitted successfully.
                  {actionData.issueNumber ? ` Ticket #${actionData.issueNumber}.` : ""}
                </div>
              )}

              <Form method="post" className="p-6 md:p-8 space-y-6">
                <div className="form-control">
                  <label className="label" htmlFor="softwareId">
                    <span className="label-text font-medium">Software</span>
                  </label>
                  <select
                    id="softwareId"
                    name="softwareId"
                    className="select select-bordered w-full"
                    defaultValue={preselectedSoftware}
                    required
                  >
                    <option value="">Select software</option>
                    {software.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="reason">
                    <span className="label-text font-medium">Report Reason</span>
                  </label>
                  <select id="reason" name="reason" className="select select-bordered w-full" required>
                    <option value="">Select reason</option>
                    <option value="inactivity">Inactivity</option>
                    <option value="spam">Spam or deceptive content</option>
                    <option value="other">Other quality concern</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="details">
                    <span className="label-text font-medium">Details</span>
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    className="textarea textarea-bordered w-full h-32"
                    placeholder="Describe why this entry should be reviewed..."
                    minLength={20}
                    maxLength={3000}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label" htmlFor="evidenceUrl">
                      <span className="label-text font-medium">Evidence URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      id="evidenceUrl"
                      name="evidenceUrl"
                      className="input input-bordered w-full"
                      placeholder="https://example.com/proof"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label" htmlFor="contactEmail">
                      <span className="label-text font-medium">Contact Email (Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      className="input input-bordered w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="cursor-pointer flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50/40">
                    <input type="checkbox" name="gdprConsent" className="checkbox" required />
                    <span className="text-sm text-gray-700">
                      I consent to processing this report according to the <a href="/privacy" className="text-euBlue hover:underline">privacy policy</a>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  Submit Report
                </button>
              </Form>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
