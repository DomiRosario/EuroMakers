import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  getAllSoftwareServer,
  getSoftwareByIdServer,
  getAllCountriesServer,
} from "~/lib/software.server";
import { sendEmail } from "~/utils/smtp2go.server";
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeEmail,
} from "~/utils/sanitize.server";
import type { SubmitSoftwareData } from "~/lib/api/client";
import { applyRateLimit } from "~/utils/rate-limit.server";
import {
  buildSubmissionIssueBody,
  createGitHubIssue,
  maskEmail,
} from "~/lib/github-moderation.server";
import { getEnvVars } from "~/env.server";
import type { SubmissionPayload } from "~/lib/moderation.types";
import { isEuropeanCountry } from "~/lib/european-countries";
import { CATEGORIES } from "~/lib/categories";

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/software", "");

  try {
    // Apply rate limiting for read operations
    await applyRateLimit(request, "api.software.read");

    // Route: /api/software
    if (path === "" || path === "/") {
      const software = await getAllSoftwareServer();
      return json(software);
    }

    // Route: /api/software/countries
    if (path === "/countries") {
      const countries = await getAllCountriesServer();
      return json(countries);
    }

    // Route: /api/software/:id
    const match = path.match(/^\/([^/]+)$/);
    if (match) {
      const id = match[1];
      const software = await getSoftwareByIdServer(id);
      if (!software) {
        return json({ error: "Software not found" }, { status: 404 });
      }
      return json(software);
    }

    return json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return json(
        { error: "Too many requests, please try again later" },
        { status: 429 },
      );
    }
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Apply rate limiting for form submissions
    await applyRateLimit(request, "api.software.submit");

    const data = (await request.json()) as SubmitSoftwareData;
    const {
      name,
      website,
      logoUrl,
      country,
      category,
      description,
      longDescription,
      features,
      evidenceUrls,
      submitterEmail,
      isEuropean,
      gdprConsent,
    } = data;

    // Validate required fields
    if (
      !name ||
      !website ||
      !country ||
      !category ||
      !description ||
      !longDescription ||
      !Array.isArray(features) ||
      !Array.isArray(evidenceUrls) ||
      !submitterEmail ||
      !isEuropean ||
      !gdprConsent
    ) {
      return json({ error: "All fields are required" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedWebsite = sanitizeUrl(website);
    const sanitizedLogoUrl = sanitizeUrl(logoUrl);
    const sanitizedCountry = sanitizeText(country);
    const sanitizedCategory = sanitizeText(category);
    const sanitizedDescription = sanitizeText(description);
    const sanitizedLongDescription = sanitizeText(longDescription);
    const sanitizedFeatures = features
      .map((feature) => sanitizeText(feature))
      .filter((feature) => Boolean(feature));
    const sanitizedEvidenceUrls = evidenceUrls
      .map((url) => sanitizeUrl(url))
      .filter((url) => Boolean(url));
    const sanitizedEmail = sanitizeEmail(submitterEmail);
    const id = data.id ? generateId(data.id) : generateId(name);

    if (!isEuropeanCountry(sanitizedCountry)) {
      return json({ error: "Country must be in our European allowlist" }, { status: 400 });
    }
    if (!CATEGORIES.some((item) => item.id === sanitizedCategory)) {
      return json({ error: "Invalid category selected" }, { status: 400 });
    }
    if (sanitizedLogoUrl && !isHttpUrl(sanitizedLogoUrl)) {
      return json({ error: "Logo URL must be a valid http/https URL" }, { status: 400 });
    }
    if (sanitizedFeatures.length < 2 || sanitizedFeatures.length > 8) {
      return json({ error: "Features must contain between 2 and 8 values" }, { status: 400 });
    }
    if (sanitizedEvidenceUrls.length < 1 || sanitizedEvidenceUrls.length > 3) {
      return json({ error: "Evidence URLs must contain between 1 and 3 valid URLs" }, { status: 400 });
    }

    const payload: SubmissionPayload = {
      submissionType: "software-submission",
      submittedAt: new Date().toISOString(),
      id,
      name: sanitizedName,
      website: sanitizedWebsite,
      ...(sanitizedLogoUrl ? { logoUrl: sanitizedLogoUrl } : {}),
      country: sanitizedCountry,
      category: sanitizedCategory,
      description: sanitizedDescription,
      longDescription: sanitizedLongDescription,
      features: sanitizedFeatures,
      evidenceUrls: sanitizedEvidenceUrls,
      submitterEmailMasked: maskEmail(sanitizedEmail),
    };

    const env = getEnvVars();
    const issue = await createGitHubIssue({
      title: `Software submission: ${sanitizedName} (${sanitizedCountry})`,
      body: buildSubmissionIssueBody(payload),
      labels: [env.GITHUB_SUBMISSION_LABEL || "submission", "submission:new"],
    });

    // Prepare email content
    const emailText = `
New Software Submission

Ticket: #${issue.number}
Name: ${sanitizedName}
ID: ${id}
Website: ${sanitizedWebsite}
Logo URL: ${sanitizedLogoUrl || "not provided"}
Country: ${sanitizedCountry}
Category: ${sanitizedCategory}
Description: ${sanitizedDescription}
Long Description: ${sanitizedLongDescription}
Features: ${sanitizedFeatures.join(", ")}
Evidence URLs: ${sanitizedEvidenceUrls.join(", ")}
Submitter Email: ${sanitizedEmail}
European Software: ${isEuropean ? "Yes" : "No"}
GDPR Consent: ${gdprConsent ? "Yes" : "No"}
        `.trim();

    const emailHtml = `
<h2>New Software Submission</h2>

<p><strong>Ticket:</strong> #${issue.number}</p>
<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>ID:</strong> ${id}</p>
<p><strong>Website:</strong> <a href="${sanitizedWebsite}">${sanitizedWebsite}</a></p>
<p><strong>Logo URL:</strong> ${sanitizedLogoUrl ? `<a href="${sanitizedLogoUrl}">${sanitizedLogoUrl}</a>` : "not provided"}</p>
<p><strong>Country:</strong> ${sanitizedCountry}</p>
<p><strong>Category:</strong> ${sanitizedCategory}</p>
<p><strong>Description:</strong> ${sanitizedDescription}</p>
<p><strong>Long Description:</strong> ${sanitizedLongDescription}</p>
<p><strong>Features:</strong> ${sanitizedFeatures.join(", ")}</p>
<p><strong>Evidence URLs:</strong> ${sanitizedEvidenceUrls.join(", ")}</p>
<p><strong>Submitter Email:</strong> ${sanitizedEmail}</p>
<p><strong>European Software:</strong> ${isEuropean ? "Yes" : "No"}</p>
<p><strong>GDPR Consent:</strong> ${gdprConsent ? "Yes" : "No"}</p>
        `.trim();

    // Send email using SendGrid
    await sendEmail({
      to:
        process.env.SUBMISSION_EMAIL ||
        process.env.CONTACT_EMAIL ||
        "contact@euromakers.org",
      subject: `[Software Submission #${issue.number}] ${sanitizedName}`,
      text: emailText,
      html: emailHtml,
      replyTo: sanitizedEmail,
    });

    return json({ success: true, ticket: issue.number });
  } catch (error) {
    console.error("Software submission error:", error);
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return json(
        { error: "Too many requests, please try again later" },
        { status: 429 },
      );
    }
    return json(
      { error: "Failed to submit software. Please try again later." },
      { status: 500 },
    );
  }
}
