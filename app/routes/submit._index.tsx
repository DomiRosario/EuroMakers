import {
  type ActionFunctionArgs,
  json,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { Buffer } from "node:buffer";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import Layout from "~/components/Layout";
import { CATEGORIES } from "~/lib/categories";
import {
  buildSubmissionIssueBody,
  createGitHubIssue,
  maskEmail,
} from "~/lib/github-moderation.server";
import type {
  SubmissionPayload,
  UploadedLogoPayload,
} from "~/lib/moderation.types";
import {
  EUROPEAN_COUNTRY_VALUES,
  isEuropeanCountry,
} from "~/lib/european-countries";
import { getEnvVars } from "~/env.server";
import { serverApi, handleAPIError } from "~/lib/api/server";
import { applyRateLimit } from "~/utils/rate-limit.server";
import {
  sanitizeEmail,
  sanitizeText,
  sanitizeUrl,
} from "~/utils/sanitize.server";
import { sendEmail } from "~/utils/smtp2go.server";
import { buildSocialMeta } from "~/lib/meta";

interface ActionResponse {
  error?: string;
}

interface StepMeta {
  id: number;
  label: string;
  title: string;
  description: string;
  checklist: string[];
}

const STEP_META: StepMeta[] = [
  {
    id: 1,
    label: "Basics",
    title: "Basic information",
    description: "Identify the software and where it comes from.",
    checklist: [
      "Use the official product name and public homepage.",
      "Optional: upload a logo file in the final step.",
      "Choose the legal country of origin.",
      "Pick the best matching category for discoverability.",
    ],
  },
  {
    id: 2,
    label: "Description",
    title: "Product descriptions",
    description: "Explain what the software does and who it helps.",
    checklist: [
      "Keep the short description concise and specific.",
      "Use the long description for key capabilities and context.",
      "Avoid marketing claims without concrete details.",
    ],
  },
  {
    id: 3,
    label: "Evidence",
    title: "Features and proof",
    description: "List standout features and EU-origin evidence links.",
    checklist: [
      "Write one feature per line, max 8 total.",
      "Evidence links should verify company origin.",
      "Use legal, company, or about pages as evidence.",
    ],
  },
  {
    id: 4,
    label: "Review",
    title: "Final review",
    description: "Confirm contact, consent, and submit for moderation.",
    checklist: [
      "Use an email you monitor for follow-up questions.",
      "Optional: upload a logo file (PNG/JPG/WEBP/SVG/GIF/ICO).",
      "Confirm EU development and GDPR consent.",
      "Complete CAPTCHA, then submit.",
    ],
  },
];

const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const MAX_LOGO_UPLOAD_BYTES = 20 * 1024;

// Helper function to generate ID from name
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function countLines(value: string): number {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isAllowedLogoMimeType(value: string): boolean {
  return ALLOWED_LOGO_MIME_TYPES.has(String(value || "").toLowerCase());
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Apply rate limiting for form submissions
    await applyRateLimit(request, "submit");

    const formData = await request.formData();
    const name = sanitizeText(formData.get("name") as string);
    const website = sanitizeUrl(formData.get("website") as string);
    const rawLogoFile = formData.get("logoFile");
    const hasLogoUpload = rawLogoFile instanceof File && rawLogoFile.size > 0;
    const country = sanitizeText(formData.get("country") as string);
    const category = sanitizeText(formData.get("category") as string);
    const description = sanitizeText(formData.get("description") as string);
    const longDescription = sanitizeText(
      formData.get("longDescription") as string,
    );
    const features = sanitizeText(formData.get("features") as string);
    const evidenceUrlsInput = sanitizeText(formData.get("evidenceUrls") as string);
    const submitterEmail = sanitizeEmail(
      formData.get("submitterEmail") as string,
    );
    const turnstileToken = formData.get("cf-turnstile-response") as string;
    const isEuropean = formData.get("isEuropean") === "on";
    const gdprConsent = formData.get("gdprConsent") === "on";

    // Validate required fields
    if (
      !name ||
      !website ||
      !country ||
      !category ||
      !description ||
      !longDescription ||
      !features ||
      !evidenceUrlsInput ||
      !submitterEmail ||
      !turnstileToken ||
      !isEuropean ||
      !gdprConsent
    ) {
      return json<ActionResponse>(
        { error: "All fields are required and must be valid" },
        { status: 400 },
      );
    }

    // Validate field lengths
    if (description.length > 250) {
      return json<ActionResponse>(
        { error: "Short description must be less than 250 characters" },
        { status: 400 },
      );
    }

    if (longDescription.length > 5000) {
      return json<ActionResponse>(
        { error: "Detailed description must be less than 5000 characters" },
        { status: 400 },
      );
    }

    if (!isEuropeanCountry(country)) {
      return json<ActionResponse>(
        { error: "Country must be in our European allowlist." },
        { status: 400 },
      );
    }

    if (!CATEGORIES.some((item) => item.id === category)) {
      return json<ActionResponse>(
        { error: "Please choose a valid category." },
        { status: 400 },
      );
    }

    let uploadedLogo: UploadedLogoPayload | undefined;
    if (hasLogoUpload) {
      if (!isAllowedLogoMimeType(rawLogoFile.type)) {
        return json<ActionResponse>(
          {
            error:
              "Logo file must be PNG, JPG, WEBP, SVG, GIF, or ICO.",
          },
          { status: 400 },
        );
      }

      if (rawLogoFile.size > MAX_LOGO_UPLOAD_BYTES) {
        return json<ActionResponse>(
          {
            error: `Logo file must be ${Math.floor(MAX_LOGO_UPLOAD_BYTES / 1024)}KB or less.`,
          },
          { status: 400 },
        );
      }

      const fileName = sanitizeText(rawLogoFile.name)
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .slice(0, 64);
      const dataBase64 = Buffer.from(await rawLogoFile.arrayBuffer()).toString(
        "base64",
      );

      uploadedLogo = {
        mimeType: rawLogoFile.type,
        dataBase64,
        ...(fileName ? { fileName } : {}),
      };
    }

    const featuresArray = features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // Validate features array
    if (featuresArray.length < 2) {
      return json<ActionResponse>(
        { error: "Please provide at least 2 features, one per line" },
        { status: 400 },
      );
    }

    if (featuresArray.length > 8) {
      return json<ActionResponse>(
        { error: "Please provide maximum 8 features" },
        { status: 400 },
      );
    }

    // Validate individual feature length
    const tooLongFeatures = featuresArray.filter((f) => f.trim().length > 50);
    if (tooLongFeatures.length > 0) {
      return json<ActionResponse>(
        { error: "Each feature must be 50 characters or less" },
        { status: 400 },
      );
    }

    const evidenceUrls = evidenceUrlsInput
      .split("\n")
      .map((url) => sanitizeUrl(url))
      .filter((url) => Boolean(url));

    if (evidenceUrls.length < 1 || evidenceUrls.length > 3) {
      return json<ActionResponse>(
        { error: "Please provide between 1 and 3 valid evidence URLs" },
        { status: 400 },
      );
    }

    // Verify Turnstile token first since it's quick
    await serverApi.turnstile.verify(turnstileToken);

    const id = generateId(name);
    const env = getEnvVars();
    const issuePayload: SubmissionPayload = {
      submissionType: "software-submission",
      submittedAt: new Date().toISOString(),
      id,
      name,
      website,
      ...(uploadedLogo ? { uploadedLogo } : {}),
      country,
      category,
      description,
      longDescription,
      features: featuresArray,
      evidenceUrls,
      submitterEmailMasked: maskEmail(submitterEmail),
    };

    const issueResult = await createGitHubIssue({
      title: `Software submission: ${name} (${country})`,
      body: buildSubmissionIssueBody(issuePayload),
      labels: [env.GITHUB_SUBMISSION_LABEL || "submission", "submission:new"],
    });

    try {
      const emailText = [
        "New Software Submission",
        "",
        `Ticket: #${issueResult.number}`,
        `Name: ${name}`,
        `ID: ${id}`,
        `Website: ${website}`,
        uploadedLogo
          ? `Logo: upload provided (${uploadedLogo.mimeType}, ${hasLogoUpload ? rawLogoFile.size : 0} bytes)`
          : "Logo: not provided",
        `Country: ${country}`,
        `Category: ${category}`,
        `Submitter Email: ${submitterEmail}`,
        "",
        "Evidence URLs:",
        ...evidenceUrls.map((url) => `- ${url}`),
        "",
        "Description:",
        description,
        "",
        "Long Description:",
        longDescription,
        "",
        "Features:",
        ...featuresArray.map((feature) => `- ${feature}`),
      ].join("\n");

      const emailHtml = [
        "<h2>New Software Submission</h2>",
        `<p><strong>Ticket:</strong> #${issueResult.number}</p>`,
        `<p><strong>Name:</strong> ${name}</p>`,
        `<p><strong>ID:</strong> ${id}</p>`,
        `<p><strong>Website:</strong> <a href="${website}">${website}</a></p>`,
        uploadedLogo
          ? `<p><strong>Logo:</strong> upload provided (${uploadedLogo.mimeType})</p>`
          : "<p><strong>Logo:</strong> not provided</p>",
        `<p><strong>Country:</strong> ${country}</p>`,
        `<p><strong>Category:</strong> ${category}</p>`,
        `<p><strong>Submitter Email:</strong> ${submitterEmail}</p>`,
        "<h3>Evidence URLs</h3>",
        `<ul>${evidenceUrls
          .map((url) => `<li><a href="${url}">${url}</a></li>`)
          .join("")}</ul>`,
        `<p><strong>Description:</strong> ${description}</p>`,
        `<p><strong>Long Description:</strong><br>${longDescription.replace(/\n/g, "<br>")}</p>`,
        "<h3>Features</h3>",
        `<ul>${featuresArray.map((feature) => `<li>${feature}</li>`).join("")}</ul>`,
      ].join("");

      await sendEmail({
        to:
          process.env.SUBMISSION_EMAIL ||
          process.env.CONTACT_EMAIL ||
          "contact@euromakers.org",
        subject: `[Submission #${issueResult.number}] ${name}`,
        text: emailText,
        html: emailHtml,
        replyTo: submitterEmail,
      });
    } catch (emailError) {
      console.error("Submission notification email failed:", emailError);
    }

    return redirect(`/submit/success?ticket=${issueResult.number}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid CAPTCHA verification"
    ) {
      return json<ActionResponse>(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 },
      );
    }
    return handleAPIError(error);
  }
}

export const meta: MetaFunction = () =>
  buildSocialMeta({
    title: "Submit Software - EuroMakers",
    description:
      "Submit a software product built in Europe to be reviewed and added to the EuroMakers directory.",
    path: "/submit",
  });

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    country: "",
    category: "",
    description: "",
    longDescription: "",
    features: "",
    evidenceUrls: "",
    submitterEmail: "",
    isEuropean: false,
    gdprConsent: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const actionData = useActionData<ActionResponse>();
  const formRef = useRef<HTMLFormElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [logoFileName, setLogoFileName] = useState("");

  const totalSteps = 4;
  const turnstileSiteKey =
    (typeof window !== "undefined" &&
      window.ENV?.CLOUDFLARE_TURNSTILE_SITE_KEY) ||
    "0x4AAAAAABAgVA930JNOQMwm";

  const onTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    if (fieldErrors.turnstile) {
      setFieldErrors((prev) => ({ ...prev, turnstile: "" }));
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFeaturesChange = (value: string) => {
    const lines = value.split("\n");
    const limitedLines = lines.map((line) => line.slice(0, 50));
    const limitedValue = limitedLines.join("\n");

    setFormData((prev) => ({ ...prev, features: limitedValue }));
    if (fieldErrors.features) {
      setFieldErrors((prev) => ({ ...prev, features: "" }));
    }
  };

  const handleEvidenceChange = (value: string) => {
    const lines = value.split("\n").slice(0, 3);
    const limitedValue = lines.join("\n");

    setFormData((prev) => ({ ...prev, evidenceUrls: limitedValue }));
    if (fieldErrors.evidenceUrls) {
      setFieldErrors((prev) => ({ ...prev, evidenceUrls: "" }));
    }
  };

  const validateStepWithErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name) errors.name = "Software name is required";
        if (!formData.website) {
          errors.website = "Website URL is required";
        } else {
          if (!isHttpUrl(formData.website)) {
            errors.website =
              "Please enter a valid URL (e.g., https://example.com)";
          }
        }
        if (!formData.country) errors.country = "Country selection is required";
        if (!formData.category)
          errors.category = "Category selection is required";
        break;
      case 2:
        if (!formData.description) {
          errors.description = "Short description is required";
        } else if (formData.description.length < 10) {
          errors.description = "Short description must be at least 10 characters";
        } else if (formData.description.length > 250) {
          errors.description = "Short description must be less than 250 characters";
        }
        if (!formData.longDescription) {
          errors.longDescription = "Detailed description is required";
        } else if (formData.longDescription.length < 50) {
          errors.longDescription =
            "Detailed description must be at least 50 characters";
        } else if (formData.longDescription.length > 5000) {
          errors.longDescription =
            "Detailed description must be less than 5000 characters";
        }
        break;
      case 3:
        if (!formData.features) {
          errors.features = "Features list is required";
        } else {
          const featuresArray = formData.features
            .split("\n")
            .filter((f) => f.trim().length > 0);
          if (featuresArray.length < 2) {
            errors.features = "Please provide at least 2 features";
          } else if (featuresArray.length > 8) {
            errors.features = "Please provide maximum 8 features";
          } else {
            const tooLongFeatures = featuresArray.filter(
              (f) => f.trim().length > 50,
            );
            if (tooLongFeatures.length > 0) {
              errors.features = "Each feature must be 50 characters or less";
            }
          }
        }

        if (!formData.evidenceUrls) {
          errors.evidenceUrls = "At least one evidence URL is required";
        } else {
          const evidenceUrls = formData.evidenceUrls
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

          if (evidenceUrls.length < 1 || evidenceUrls.length > 3) {
            errors.evidenceUrls = "Please provide between 1 and 3 evidence URLs";
          } else {
            const invalidEvidenceUrl = evidenceUrls.some((url) => {
              try {
                new URL(url);
                return false;
              } catch {
                return true;
              }
            });

            if (invalidEvidenceUrl) {
              errors.evidenceUrls =
                "Please enter valid URLs (e.g., https://example.com/about)";
            }
          }
        }
        break;
      case 4:
        if (!formData.submitterEmail) {
          errors.submitterEmail = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitterEmail)) {
          errors.submitterEmail = "Please enter a valid email address";
        }
        {
          const selectedLogoFile = logoFileInputRef.current?.files?.[0];
          if (selectedLogoFile) {
            if (!isAllowedLogoMimeType(selectedLogoFile.type)) {
              errors.logoFile =
                "Logo file must be PNG, JPG, WEBP, SVG, GIF, or ICO.";
            } else if (selectedLogoFile.size > MAX_LOGO_UPLOAD_BYTES) {
              errors.logoFile = `Logo file must be ${Math.floor(
                MAX_LOGO_UPLOAD_BYTES / 1024,
              )}KB or less.`;
            }
          }
        }
        if (!formData.isEuropean)
          errors.isEuropean = "Please confirm this is European software";
        if (!formData.gdprConsent)
          errors.gdprConsent = "GDPR consent is required";
        if (!turnstileToken) errors.turnstile = "Please complete the CAPTCHA";
        break;
    }

    return errors;
  };

  const nextStep = () => {
    const errors = validateStepWithErrors(currentStep);
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0 && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const countries = EUROPEAN_COUNTRY_VALUES;

  const categories = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })).sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const featureCount = countLines(formData.features);
  const evidenceCount = countLines(formData.evidenceUrls);
  const activeStepMeta = STEP_META[currentStep - 1];
  const stepProgressPercentage =
    totalSteps <= 1
      ? 100
      : Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  const getStepStatus = (stepId: number): "current" | "complete" | "pending" => {
    if (stepId === currentStep) {
      return "current";
    }

    if (stepId === 1) {
      const done =
        Boolean(formData.name) &&
        Boolean(formData.website) &&
        Boolean(formData.country) &&
        Boolean(formData.category);
      return done ? "complete" : "pending";
    }

    if (stepId === 2) {
      const done = Boolean(formData.description) && Boolean(formData.longDescription);
      return done ? "complete" : "pending";
    }

    if (stepId === 3) {
      const done = featureCount >= 2 && evidenceCount >= 1;
      return done ? "complete" : "pending";
    }

    const done =
      Boolean(formData.submitterEmail) &&
      formData.isEuropean &&
      formData.gdprConsent &&
      Boolean(turnstileToken);
    return done ? "complete" : "pending";
  };

  const renderError = (field: string) =>
    fieldErrors[field] ? (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  return (
    <Layout>
      <main className="w-full overflow-x-hidden">
        <section className="eu-section min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,51,153,0.16),_rgba(255,255,255,0.85)_45%,_white_80%)]">
          <div className="eu-container max-w-6xl px-4 sm:px-6">
            <div className="mb-8 rounded-2xl border border-blue-100 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Submission Workflow
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Submit European Software
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                    The process takes around 5 minutes. Complete each step and we will
                    create a moderation ticket immediately after submission.
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  <p className="font-semibold">Step {currentStep} of {totalSteps}</p>
                  <p className="text-xs text-blue-700">{activeStepMeta.title}</p>
                </div>
              </div>

              <div className="mt-5 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-euBlue to-blue-500 transition-all duration-500"
                  style={{ width: `${stepProgressPercentage}%` }}
                />
              </div>

              <ol className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {STEP_META.map((step) => {
                  const status = getStepStatus(step.id);
                  return (
                    <li
                      key={step.id}
                      className={`rounded-xl border px-3 py-3 text-left transition-all ${
                        status === "current"
                          ? "border-blue-300 bg-blue-50"
                          : status === "complete"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            status === "current"
                              ? "bg-euBlue text-white"
                              : status === "complete"
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {status === "complete" ? "✓" : step.id}
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {step.label}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                      <p className="mt-1 text-xs text-gray-600">{step.description}</p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="order-2 lg:order-1">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-blue-100/30">
                  {actionData?.error && (
                    <div className="border-b border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                      <p className="font-semibold">Submission could not be sent</p>
                      <p className="mt-1">{actionData.error}</p>
                    </div>
                  )}

                  <Form
                    ref={formRef}
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-8 p-5 md:p-8"
                  >
                    <input type="hidden" name="name" value={formData.name} />
                    <input type="hidden" name="website" value={formData.website} />
                    <input type="hidden" name="country" value={formData.country} />
                    <input type="hidden" name="category" value={formData.category} />
                    <input type="hidden" name="description" value={formData.description} />
                    <input
                      type="hidden"
                      name="longDescription"
                      value={formData.longDescription}
                    />
                    <input type="hidden" name="features" value={formData.features} />
                    <input type="hidden" name="evidenceUrls" value={formData.evidenceUrls} />
                    <input
                      type="hidden"
                      name="submitterEmail"
                      value={formData.submitterEmail}
                    />
                    <input
                      type="hidden"
                      name="isEuropean"
                      value={formData.isEuropean ? "on" : ""}
                    />
                    <input
                      type="hidden"
                      name="gdprConsent"
                      value={formData.gdprConsent ? "on" : ""}
                    />

                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Current section
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-gray-900">
                        {activeStepMeta.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {activeStepMeta.description}
                      </p>
                    </div>

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="form-control gap-2">
                            <label className="text-sm font-semibold text-gray-800" htmlFor="name">
                              Software name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="name"
                              className={`input input-bordered w-full ${
                                fieldErrors.name ? "input-error" : ""
                              }`}
                              placeholder="e.g. Nextcloud"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              aria-invalid={Boolean(fieldErrors.name)}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Use the official public product name.
                            </p>
                            {renderError("name")}
                          </div>

                          <div className="form-control gap-2">
                            <label className="text-sm font-semibold text-gray-800" htmlFor="website">
                              Website URL <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="url"
                              id="website"
                              className={`input input-bordered w-full ${
                                fieldErrors.website ? "input-error" : ""
                              }`}
                              placeholder="https://example.com"
                              value={formData.website}
                              onChange={(e) => handleInputChange("website", e.target.value)}
                              aria-invalid={Boolean(fieldErrors.website)}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Include the full URL with <code>https://</code>.
                            </p>
                            {renderError("website")}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="form-control gap-2">
                            <label className="text-sm font-semibold text-gray-800" htmlFor="country">
                              Country of origin <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="country"
                              className={`select select-bordered w-full ${
                                fieldErrors.country ? "select-error" : ""
                              }`}
                              value={formData.country}
                              onChange={(e) => handleInputChange("country", e.target.value)}
                              aria-invalid={Boolean(fieldErrors.country)}
                              required
                            >
                              <option value="">Select a country</option>
                              {countries.map((country) => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500">
                              Choose the country where the product is primarily developed.
                            </p>
                            {renderError("country")}
                          </div>

                          <div className="form-control gap-2">
                            <label className="text-sm font-semibold text-gray-800" htmlFor="category">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="category"
                              className={`select select-bordered w-full ${
                                fieldErrors.category ? "select-error" : ""
                              }`}
                              value={formData.category}
                              onChange={(e) => handleInputChange("category", e.target.value)}
                              aria-invalid={Boolean(fieldErrors.category)}
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500">
                              Pick the category users would expect to browse.
                            </p>
                            {renderError("category")}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="form-control gap-2">
                          <label
                            className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-800"
                            htmlFor="description"
                          >
                            <span>
                              Short description <span className="text-red-500">*</span>
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                formData.description.length > 220
                                  ? "text-amber-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {formData.description.length}/250
                            </span>
                          </label>
                          <textarea
                            id="description"
                            className={`textarea textarea-bordered h-24 w-full ${
                              fieldErrors.description ? "textarea-error" : ""
                            }`}
                            placeholder="One or two sentences that explain the software clearly."
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            minLength={10}
                            maxLength={250}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Appears in software cards and search results.
                          </p>
                          {renderError("description")}
                        </div>

                        <div className="form-control gap-2">
                          <label
                            className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-800"
                            htmlFor="longDescription"
                          >
                            <span>
                              Detailed description <span className="text-red-500">*</span>
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                formData.longDescription.length > 4700
                                  ? "text-amber-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {formData.longDescription.length}/5000
                            </span>
                          </label>
                          <textarea
                            id="longDescription"
                            className={`textarea textarea-bordered h-40 w-full ${
                              fieldErrors.longDescription ? "textarea-error" : ""
                            }`}
                            placeholder="Explain who it is for, key capabilities, and why it is a strong European choice."
                            value={formData.longDescription}
                            onChange={(e) =>
                              handleInputChange("longDescription", e.target.value)
                            }
                            minLength={50}
                            maxLength={5000}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Minimum 50 characters. Include practical detail, not just slogans.
                          </p>
                          {renderError("longDescription")}
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="grid gap-6 xl:grid-cols-2">
                          <div className="form-control gap-2">
                            <label
                              className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-800"
                              htmlFor="features"
                            >
                              <span>
                                Features list <span className="text-red-500">*</span>
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  featureCount > 8 ? "text-red-700" : "text-gray-500"
                                }`}
                              >
                                {featureCount}/8 lines
                              </span>
                            </label>
                            <textarea
                              id="features"
                              className={`textarea textarea-bordered h-48 w-full ${
                                fieldErrors.features ? "textarea-error" : ""
                              }`}
                              placeholder={[
                                "Open-source and self-hostable",
                                "End-to-end encryption",
                                "Cross-platform support",
                                "API for integrations",
                                "GDPR compliant",
                              ].join("\n")}
                              value={formData.features}
                              onChange={(e) => handleFeaturesChange(e.target.value)}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              One feature per line. Keep each line under 50 characters.
                            </p>
                            {renderError("features")}
                          </div>

                          <div className="form-control gap-2">
                            <label
                              className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-800"
                              htmlFor="evidenceUrls"
                            >
                              <span>
                                Evidence URLs <span className="text-red-500">*</span>
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  evidenceCount > 3 ? "text-red-700" : "text-gray-500"
                                }`}
                              >
                                {evidenceCount}/3 links
                              </span>
                            </label>
                            <textarea
                              id="evidenceUrls"
                              className={`textarea textarea-bordered h-48 w-full ${
                                fieldErrors.evidenceUrls ? "textarea-error" : ""
                              }`}
                              placeholder={[
                                "https://example.com/about",
                                "https://example.com/legal",
                                "https://example.com/company",
                              ].join("\n")}
                              value={formData.evidenceUrls}
                              onChange={(e) => handleEvidenceChange(e.target.value)}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Provide 1 to 3 links that prove European ownership or development.
                            </p>
                            {renderError("evidenceUrls")}
                          </div>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-900">Stronger submissions pass moderation faster</p>
                          <ul className="mt-2 space-y-1 text-sm text-blue-800">
                            <li>Use verifiable legal or company pages for evidence links.</li>
                            <li>Keep features specific and user-visible.</li>
                            <li>Avoid repeating the same claim across multiple lines.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="form-control gap-2">
                          <label
                            className="text-sm font-semibold text-gray-800"
                            htmlFor="submitterEmail"
                          >
                            Contact email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="submitterEmail"
                            className={`input input-bordered w-full ${
                              fieldErrors.submitterEmail ? "input-error" : ""
                            }`}
                            placeholder="you@example.com"
                            value={formData.submitterEmail}
                            onChange={(e) =>
                              handleInputChange("submitterEmail", e.target.value)
                            }
                            aria-invalid={Boolean(fieldErrors.submitterEmail)}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            We only use this if clarification is needed during moderation.
                          </p>
                          {renderError("submitterEmail")}
                        </div>

                        <div className="form-control gap-2">
                          <label className="text-sm font-semibold text-gray-800" htmlFor="logoFile">
                            Upload logo file <span className="text-gray-400">(optional)</span>
                          </label>
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            id="logoFile"
                            name="logoFile"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,image/x-icon,image/vnd.microsoft.icon"
                            className={`file-input file-input-bordered w-full ${
                              fieldErrors.logoFile ? "file-input-error" : ""
                            }`}
                            onChange={(e) => {
                              const nextFile = e.target.files?.[0];
                              setLogoFileName(nextFile?.name || "");
                              if (fieldErrors.logoFile) {
                                setFieldErrors((prev) => ({ ...prev, logoFile: "" }));
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500">
                            Supported: PNG, JPG, WEBP, SVG, GIF, ICO. Max {Math.floor(MAX_LOGO_UPLOAD_BYTES / 1024)}KB.
                          </p>
                          {renderError("logoFile")}
                        </div>

                        <div className="space-y-3">
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                              fieldErrors.isEuropean
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox mt-0.5"
                              checked={formData.isEuropean}
                              onChange={(e) =>
                                handleInputChange("isEuropean", e.target.checked)
                              }
                              required
                            />
                            <span className="text-sm text-gray-700">
                              I confirm this software is primarily developed in Europe.
                            </span>
                          </label>
                          {renderError("isEuropean")}

                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                              fieldErrors.gdprConsent
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox mt-0.5"
                              checked={formData.gdprConsent}
                              onChange={(e) =>
                                handleInputChange("gdprConsent", e.target.checked)
                              }
                              required
                            />
                            <span className="text-sm text-gray-700">
                              I consent to data processing under the{" "}
                              <a href="/privacy" className="font-medium text-euBlue hover:underline">
                                privacy policy
                              </a>
                              .
                            </span>
                          </label>
                          {renderError("gdprConsent")}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <p className="mb-3 text-sm font-semibold text-gray-800">
                            Human verification
                          </p>
                          <div className="flex flex-col items-center gap-2 sm:items-start">
                            <Turnstile
                              siteKey={turnstileSiteKey}
                              onSuccess={onTurnstileSuccess}
                              options={{
                                theme: "light",
                              }}
                            />
                            {renderError("turnstile")}
                          </div>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                          <h3 className="text-sm font-semibold text-blue-900">Review snapshot</h3>
                          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                            <div>
                              <dt className="font-medium text-blue-700">Software</dt>
                              <dd className="text-blue-900">{formData.name || "Not provided"}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-blue-700">Category</dt>
                              <dd className="text-blue-900">{formData.category || "Not selected"}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-blue-700">Country</dt>
                              <dd className="text-blue-900">{formData.country || "Not selected"}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-blue-700">Logo file</dt>
                              <dd className="text-blue-900">
                                {logoFileName ? "Uploaded" : "Not provided"}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-blue-700">Evidence links</dt>
                              <dd className="text-blue-900">{evidenceCount} provided</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className={`btn btn-ghost text-gray-700 ${
                          currentStep === 1 ? "pointer-events-none opacity-40" : ""
                        }`}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </button>

                      <p className="text-center text-xs text-gray-500">
                        Your inputs stay saved while moving between steps.
                      </p>

                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="btn border-0 bg-euBlue text-white shadow hover:bg-blue-700"
                        >
                          Continue to {STEP_META[currentStep].label}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const errors = validateStepWithErrors(currentStep);
                            setFieldErrors(errors);
                            if (Object.keys(errors).length === 0) {
                              formRef.current?.submit();
                            }
                          }}
                          className="btn border-0 bg-euBlue text-white shadow hover:bg-blue-700"
                        >
                          Submit for moderation
                        </button>
                      )}
                    </div>
                  </Form>
                </div>
              </div>

              <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
                <div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Step guidance
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {activeStepMeta.title}
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      {activeStepMeta.checklist.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-euBlue" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
