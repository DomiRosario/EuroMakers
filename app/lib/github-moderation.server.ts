import { getEnvVars } from "~/env.server";
import type { ReportPayload, SubmissionPayload } from "~/lib/moderation.types";

export interface GitHubIssueResult {
  number: number;
  htmlUrl: string;
}

interface CreateGitHubIssueOptions {
  title: string;
  body: string;
  labels: string[];
}

export function maskEmail(email: string): string {
  const [localPart, domain = ""] = email.split("@");
  if (!localPart || !domain) {
    return "redacted";
  }

  const first = localPart.slice(0, 1);
  return `${first}***@${domain}`;
}

function ensureGitHubConfig() {
  const env = getEnvVars();
  const { GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_MODERATION_TOKEN } = env;

  if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME || !GITHUB_MODERATION_TOKEN) {
    throw new Error(
      "GitHub moderation environment variables are not configured",
    );
  }

  return {
    owner: GITHUB_REPO_OWNER,
    repo: GITHUB_REPO_NAME,
    token: GITHUB_MODERATION_TOKEN,
  };
}

export async function createGitHubIssue({
  title,
  body,
  labels,
}: CreateGitHubIssueOptions): Promise<GitHubIssueResult> {
  const { owner, repo, token } = ensureGitHubConfig();

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "euromakers-moderation-bot",
    },
    body: JSON.stringify({ title, body, labels }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GitHub issue creation failed (${response.status}): ${errorBody}`,
    );
  }

  const data = (await response.json()) as { number: number; html_url: string };

  return {
    number: data.number,
    htmlUrl: data.html_url,
  };
}

export function buildSubmissionIssueBody(payload: SubmissionPayload): string {
  const payloadJson = payload.uploadedLogo
    ? JSON.stringify(payload)
    : JSON.stringify(payload, null, 2);
  const logoLine = payload.uploadedLogo
    ? `provided via upload (${payload.uploadedLogo.mimeType})`
    : payload.logoUrl
      ? payload.logoUrl
      : "not provided";

  return [
    "## New Software Submission",
    "",
    `- **Name:** ${payload.name}`,
    `- **ID:** ${payload.id}`,
    `- **Website:** ${payload.website}`,
    `- **Logo:** ${logoLine}`,
    `- **Country:** ${payload.country}`,
    `- **Category:** ${payload.category}`,
    `- **Submitter Email:** ${payload.submitterEmailMasked}`,
    `- **Submitted At:** ${payload.submittedAt}`,
    "",
    "## Evidence URLs",
    ...payload.evidenceUrls.map((url) => `- ${url}`),
    "",
    "## Payload",
    "```json",
    payloadJson,
    "```",
  ].join("\n");
}

export function buildReportIssueBody(payload: ReportPayload): string {
  return [
    "## Software Report",
    "",
    `- **Software ID:** ${payload.softwareId}`,
    `- **Reason:** ${payload.reason}`,
    `- **Submitted At:** ${payload.submittedAt}`,
    payload.contactEmailMasked
      ? `- **Contact Email:** ${payload.contactEmailMasked}`
      : "- **Contact Email:** not provided",
    payload.evidenceUrl
      ? `- **Evidence URL:** ${payload.evidenceUrl}`
      : "- **Evidence URL:** not provided",
    "",
    "## Details",
    payload.details,
    "",
    "## Payload",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  ].join("\n");
}
