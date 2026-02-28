export type ModerationDecision = "auto-merge" | "manual-review" | "reject";

export interface ModerationScoreBreakdown {
  schemaValidity: number;
  websiteReachability: number;
  evidenceReachability: number;
  europeanOrigin: number;
  duplicateDomain: number;
  contentQuality: number;
  spamHeuristics: number;
}

export interface UploadedLogoPayload {
  mimeType: string;
  dataBase64: string;
  fileName?: string;
}

export interface SubmissionPayload {
  submissionType: "software-submission";
  submittedAt: string;
  id: string;
  name: string;
  website: string;
  logoUrl?: string;
  uploadedLogo?: UploadedLogoPayload;
  country: string;
  category: string;
  description: string;
  longDescription: string;
  features: string[];
  evidenceUrls: string[];
  submitterEmailMasked: string;
}

export interface ReportPayload {
  submissionType: "software-report";
  submittedAt: string;
  softwareId: string;
  reason: "inactivity" | "spam" | "other";
  details: string;
  evidenceUrl?: string;
  contactEmailMasked?: string;
}
