import { z } from "zod";

const serverEnvSchema = z.object({
  MAINTENANCE_MODE: z.string().optional(),
  CLOUDFLARE_TURNSTILE_SITE_KEY: z.string().optional(),
  CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().optional(),
  GITHUB_REPO_OWNER: z.string().optional(),
  GITHUB_REPO_NAME: z.string().optional(),
  GITHUB_MODERATION_TOKEN: z.string().optional(),
  GITHUB_SUBMISSION_LABEL: z.string().optional(),
  GITHUB_REPORT_LABEL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getEnvVars(): ServerEnv {
  const parsed = serverEnvSchema.parse({
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    CLOUDFLARE_TURNSTILE_SITE_KEY: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY,
    CLOUDFLARE_TURNSTILE_SECRET_KEY:
      process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
    GITHUB_REPO_OWNER: process.env.GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
    GITHUB_MODERATION_TOKEN: process.env.GITHUB_MODERATION_TOKEN,
    GITHUB_SUBMISSION_LABEL: process.env.GITHUB_SUBMISSION_LABEL,
    GITHUB_REPORT_LABEL: process.env.GITHUB_REPORT_LABEL,
  });

  return {
    ...parsed,
    GITHUB_SUBMISSION_LABEL: parsed.GITHUB_SUBMISSION_LABEL || "submission",
    GITHUB_REPORT_LABEL: parsed.GITHUB_REPORT_LABEL || "report",
  };
}

export function getPublicEnvVars() {
  const env = getEnvVars();
  return {
    MAINTENANCE_MODE: env.MAINTENANCE_MODE,
    CLOUDFLARE_TURNSTILE_SITE_KEY: env.CLOUDFLARE_TURNSTILE_SITE_KEY,
  };
}
