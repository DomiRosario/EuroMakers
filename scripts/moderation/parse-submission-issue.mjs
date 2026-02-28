import fs from "node:fs/promises";

const MAX_ISSUE_BODY_CHARS = 50000;
const MAX_PAYLOAD_BLOCK_CHARS = 25000;
const MAX_TEXT_LENGTH = 5000;
const MAX_ID_LENGTH = 80;
const MAX_URL_LENGTH = 300;
const MAX_FEATURES = 8;
const MAX_EVIDENCE_URLS = 3;
const MAX_LOGO_UPLOAD_BASE64_LENGTH = 30000;

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function normalize(value) {
  return String(value ?? "").trim();
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateTextField(payload, fieldName, min, max) {
  const value = normalize(payload[fieldName]);
  assert(value.length >= min, `${fieldName} must be at least ${min} characters`);
  assert(value.length <= max, `${fieldName} must be at most ${max} characters`);
}

function validatePayload(payload) {
  assert(payload && typeof payload === "object" && !Array.isArray(payload), "Payload must be a JSON object");
  assert(payload.submissionType === "software-submission", `Unsupported submissionType: ${payload.submissionType}`);

  validateTextField(payload, "id", 1, MAX_ID_LENGTH);
  validateTextField(payload, "name", 2, 120);
  validateTextField(payload, "country", 2, 80);
  validateTextField(payload, "category", 2, 80);
  validateTextField(payload, "description", 10, 250);
  validateTextField(payload, "longDescription", 50, MAX_TEXT_LENGTH);

  const website = normalize(payload.website);
  assert(website.length <= MAX_URL_LENGTH, "website must be at most 300 characters");
  assert(isHttpUrl(website), "website must be a valid http/https URL");

  assert(Array.isArray(payload.features), "features must be an array");
  assert(payload.features.length >= 2, "features must contain at least 2 items");
  assert(payload.features.length <= MAX_FEATURES, "features must contain at most 8 items");
  for (const feature of payload.features) {
    const normalized = normalize(feature);
    assert(normalized.length >= 2, "each feature must be at least 2 characters");
    assert(normalized.length <= 80, "each feature must be at most 80 characters");
  }

  assert(Array.isArray(payload.evidenceUrls), "evidenceUrls must be an array");
  assert(payload.evidenceUrls.length >= 1, "evidenceUrls must contain at least 1 URL");
  assert(payload.evidenceUrls.length <= MAX_EVIDENCE_URLS, "evidenceUrls must contain at most 3 URLs");
  for (const evidenceUrl of payload.evidenceUrls) {
    const normalized = normalize(evidenceUrl);
    assert(normalized.length <= MAX_URL_LENGTH, "each evidence URL must be at most 300 characters");
    assert(isHttpUrl(normalized), "each evidence URL must be a valid http/https URL");
  }

  if (payload.logoUrl !== undefined) {
    const logoUrl = normalize(payload.logoUrl);
    assert(logoUrl.length <= MAX_URL_LENGTH, "logoUrl must be at most 300 characters");
    if (logoUrl.length > 0) {
      assert(isHttpUrl(logoUrl), "logoUrl must be a valid http/https URL");
    }
  }

  if (payload.uploadedLogo !== undefined) {
    const uploadedLogo = payload.uploadedLogo;
    assert(
      uploadedLogo &&
        typeof uploadedLogo === "object" &&
        !Array.isArray(uploadedLogo),
      "uploadedLogo must be an object",
    );
    assert(
      normalize(uploadedLogo.mimeType).length > 0,
      "uploadedLogo.mimeType is required",
    );
    const dataBase64 = normalize(uploadedLogo.dataBase64);
    assert(dataBase64.length > 0, "uploadedLogo.dataBase64 is required");
    assert(
      dataBase64.length <= MAX_LOGO_UPLOAD_BASE64_LENGTH,
      "uploadedLogo.dataBase64 is too large",
    );
    assert(
      /^[A-Za-z0-9+/=]+$/.test(dataBase64),
      "uploadedLogo.dataBase64 must be base64 encoded",
    );
    if (uploadedLogo.fileName !== undefined) {
      assert(
        normalize(uploadedLogo.fileName).length <= 120,
        "uploadedLogo.fileName must be at most 120 characters",
      );
    }
  }

  if (payload.submitterEmailMasked !== undefined) {
    validateTextField(payload, "submitterEmailMasked", 3, 120);
  }
  if (payload.submittedAt !== undefined) {
    validateTextField(payload, "submittedAt", 10, 64);
  }
}

const bodyFile = getArg("--body-file");
const outputFile = getArg("--output") || "submission-payload.json";

if (!bodyFile) {
  throw new Error("Missing required argument: --body-file");
}

const issueBody = await fs.readFile(bodyFile, "utf8");
if (issueBody.length === 0) {
  throw new Error("Issue body is empty");
}
if (issueBody.length > MAX_ISSUE_BODY_CHARS) {
  throw new Error(
    `Issue body exceeds ${MAX_ISSUE_BODY_CHARS} characters`,
  );
}

const payloadMatch =
  issueBody.match(/## Payload[\s\S]*?```json\s*([\s\S]*?)```/i) ||
  issueBody.match(/```json\s*([\s\S]*?)```/i);

if (!payloadMatch?.[1]) {
  throw new Error("No JSON payload block found in issue body");
}
if (payloadMatch[1].length > MAX_PAYLOAD_BLOCK_CHARS) {
  throw new Error(
    `Payload block exceeds ${MAX_PAYLOAD_BLOCK_CHARS} characters`,
  );
}

let payload;
try {
  payload = JSON.parse(payloadMatch[1].trim());
} catch (error) {
  throw new Error(
    `Failed to parse issue payload JSON: ${error instanceof Error ? error.message : String(error)}`,
  );
}

validatePayload(payload);

await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Parsed payload written to ${outputFile}`);
