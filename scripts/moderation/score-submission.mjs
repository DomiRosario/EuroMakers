import fs from "node:fs/promises";
import dns from "node:dns/promises";
import net from "node:net";
import path from "node:path";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

const inputFile = getArg("--input") || "submission-payload.json";
const outputFile = getArg("--output") || "moderation-score.json";
const softwareDir = getArg("--software-dir") || "data/software";

const EUROPEAN_COUNTRIES = new Set(
  [
    "albania",
    "andorra",
    "armenia",
    "austria",
    "azerbaijan",
    "belarus",
    "belgium",
    "bosnia and herzegovina",
    "bulgaria",
    "croatia",
    "cyprus",
    "czech republic",
    "denmark",
    "estonia",
    "finland",
    "france",
    "georgia",
    "germany",
    "greece",
    "hungary",
    "iceland",
    "ireland",
    "italy",
    "kosovo",
    "latvia",
    "liechtenstein",
    "lithuania",
    "luxembourg",
    "malta",
    "moldova",
    "monaco",
    "montenegro",
    "netherlands",
    "north macedonia",
    "norway",
    "poland",
    "portugal",
    "romania",
    "san marino",
    "serbia",
    "slovakia",
    "slovenia",
    "spain",
    "sweden",
    "switzerland",
    "ukraine",
    "united kingdom",
    "vatican city",
    "multiple eu countries",
    "eu",
    "european union",
  ].map((country) => country.toLowerCase()),
);

const ALLOWED_CATEGORIES = new Set([
  "artificial-intelligence",
  "cloud",
  "marketing",
  "productivity",
  "communication",
  "design",
  "developer-tools",
  "entertainment",
  "finance",
  "office",
  "personal-finances",
  "search-engine",
  "security",
  "web-analytics",
  "web-browsers",
]);

const EU_TLDS = new Set([
  "at",
  "be",
  "bg",
  "hr",
  "cy",
  "cz",
  "dk",
  "ee",
  "fi",
  "fr",
  "de",
  "gr",
  "hu",
  "ie",
  "it",
  "lv",
  "lt",
  "lu",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "sk",
  "si",
  "es",
  "se",
  "eu",
  "ch",
  "no",
  "is",
  "uk",
]);

const SPAM_KEYWORDS = [
  "casino",
  "betting",
  "viagra",
  "porn",
  "adult",
  "crypto giveaway",
  "earn money fast",
  "double your money",
  "loan guarantee",
  "hot singles",
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
const MAX_LOGO_UPLOAD_BASE64_LENGTH = 30000;
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "169.254.169.254",
  "0.0.0.0",
]);

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeCategory(value) {
  return slugify(value);
}

function isUrl(value) {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol === "http:" || parsed.protocol === "https:");
  } catch {
    return false;
  }
}

function normalizeLogoUrl(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return "";
  }
  return isUrl(normalized) ? normalized : "";
}

function normalizeUploadedLogo(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const mimeType = normalizeWhitespace(value.mimeType).toLowerCase();
  const dataBase64 = normalizeWhitespace(value.dataBase64);
  const fileName = normalizeWhitespace(value.fileName);

  if (!mimeType || !dataBase64) {
    return null;
  }
  if (!ALLOWED_LOGO_MIME_TYPES.has(mimeType)) {
    return null;
  }
  if (dataBase64.length > MAX_LOGO_UPLOAD_BASE64_LENGTH) {
    return null;
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(dataBase64)) {
    return null;
  }

  return {
    mimeType,
    dataBase64,
    ...(fileName ? { fileName } : {}),
  };
}

function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function topLevelDomain(url) {
  const hostname = extractHostname(url);
  const parts = hostname.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function normalizeHostname(hostname) {
  return String(hostname || "")
    .trim()
    .replace(/\.$/, "")
    .toLowerCase();
}

function isBlockedHostname(hostname) {
  const normalized = normalizeHostname(hostname);
  return (
    BLOCKED_HOSTNAMES.has(normalized) ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".internal")
  );
}

function isPrivateIPv4(ip) {
  const parts = String(ip || "")
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return true;
  }
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIPv6(ip) {
  const normalized = String(ip || "").toLowerCase().split("%")[0];
  if (!normalized || normalized === "::" || normalized === "::1") {
    return true;
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }
  if (normalized.startsWith("fe80")) {
    return true;
  }
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIPv4(normalized.slice("::ffff:".length));
  }
  return false;
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    return isPrivateIPv4(address);
  }
  if (family === 6) {
    return isPrivateIPv6(address);
  }
  return true;
}

async function assertSafeRemoteUrl(urlValue) {
  const parsed = new URL(urlValue);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http/https URLs are allowed");
  }
  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname || isBlockedHostname(hostname)) {
    throw new Error("Blocked hostname");
  }
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error("Blocked private or loopback IP");
    }
    return;
  }
  const resolved = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!resolved.length) {
    throw new Error("Hostname resolution failed");
  }
  for (const record of resolved) {
    if (isPrivateAddress(record.address)) {
      throw new Error("Blocked private or loopback DNS resolution result");
    }
  }
}

function isSlug(value) {
  return /^[a-z0-9-]+$/.test(value);
}

function buildSafeTargetPath(category, id) {
  if (!isSlug(category) || !isSlug(id)) {
    return null;
  }
  const candidate = path.posix.join("data/software", category, `${id}.json`);
  if (!candidate.startsWith("data/software/") || !candidate.endsWith(".json")) {
    return null;
  }
  return candidate;
}

async function walkJsonFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkJsonFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function loadExistingSoftware(directory) {
  const files = await walkJsonFiles(directory);
  const existing = [];

  for (const file of files) {
    try {
      const parsed = JSON.parse(await fs.readFile(file, "utf8"));
      const id = normalizeWhitespace(parsed.id).toLowerCase();
      const website = normalizeWhitespace(parsed.website);
      existing.push({
        id,
        website,
        hostname: website ? extractHostname(website) : "",
      });
    } catch {
      // Ignore malformed files in scoring pass.
    }
  }

  return existing;
}

async function checkUrlReachable(url) {
  if (!isUrl(url)) {
    return false;
  }

  let currentUrl = url;
  for (const method of ["HEAD", "GET"]) {
    currentUrl = url;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      for (let i = 0; i < 4; i += 1) {
        await assertSafeRemoteUrl(currentUrl);
        const response = await fetch(currentUrl, {
          method,
          redirect: "manual",
          signal: controller.signal,
        });

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get("location");
          if (!location) {
            break;
          }
          currentUrl = new URL(location, currentUrl).toString();
          continue;
        }

        if (response.status < 500) {
          clearTimeout(timeout);
          return true;
        }
        break;
      }
    } catch {
      // Try next method.
    } finally {
      clearTimeout(timeout);
    }
  }

  return false;
}

const payload = JSON.parse(await fs.readFile(inputFile, "utf8"));
const existingSoftware = await loadExistingSoftware(softwareDir);

const reasons = [];
const breakdown = {
  schemaValidity: 0,
  websiteReachability: 0,
  evidenceReachability: 0,
  europeanOrigin: 0,
  duplicateDomain: 0,
  contentQuality: 0,
  spamHeuristics: 0,
};

const normalizedId = slugify(payload.id || payload.name);
const normalizedCategory = normalizeCategory(payload.category);
const normalizedLogoUrl = normalizeLogoUrl(payload.logoUrl || payload.logo);
const normalizedUploadedLogo = normalizeUploadedLogo(payload.uploadedLogo);

const normalizedEntry = {
  id: normalizedId,
  name: normalizeWhitespace(payload.name),
  description: normalizeWhitespace(payload.description),
  category: normalizedCategory,
  country: normalizeWhitespace(payload.country),
  logo: "/images/placeholder.svg",
  website: normalizeWhitespace(payload.website),
  longDescription: normalizeWhitespace(payload.longDescription),
  features: Array.isArray(payload.features)
    ? payload.features.map((feature) => normalizeWhitespace(feature)).filter(Boolean)
    : [],
};

if ((payload.logoUrl || payload.logo) && !normalizedLogoUrl) {
  reasons.push("Submitted logo URL was invalid; placeholder logo will be used.");
}
if (payload.uploadedLogo && !normalizedUploadedLogo) {
  reasons.push("Uploaded logo file was invalid; placeholder logo will be used.");
}

const normalizedEvidenceUrls = Array.isArray(payload.evidenceUrls)
  ? payload.evidenceUrls.map((url) => normalizeWhitespace(url)).filter(Boolean)
  : [];
const targetPath = buildSafeTargetPath(normalizedCategory, normalizedEntry.id);

const schemaChecks = [
  Boolean(normalizedEntry.id && isSlug(normalizedEntry.id)),
  normalizedEntry.name.length >= 2,
  normalizedEntry.description.length >= 10 && normalizedEntry.description.length <= 250,
  normalizedEntry.longDescription.length >= 50 && normalizedEntry.longDescription.length <= 5000,
  normalizedEntry.features.length >= 2 && normalizedEntry.features.length <= 8,
  normalizedEntry.features.every((feature) => feature.length <= 50),
  isUrl(normalizedEntry.website),
  normalizedEvidenceUrls.length >= 1 && normalizedEvidenceUrls.length <= 3,
  normalizedEvidenceUrls.every((url) => isUrl(url)),
  ALLOWED_CATEGORIES.has(normalizedCategory),
  normalizedEntry.country.length > 0,
  Boolean(targetPath),
];

const passedSchemaChecks = schemaChecks.filter(Boolean).length;
breakdown.schemaValidity = Math.round((passedSchemaChecks / schemaChecks.length) * 20);
if (breakdown.schemaValidity < 20) {
  reasons.push("Schema quality checks are incomplete.");
}

const websiteReachable = await checkUrlReachable(normalizedEntry.website);
breakdown.websiteReachability = websiteReachable ? 20 : 0;
if (!websiteReachable) {
  reasons.push("Website could not be reached during moderation checks.");
}

let reachableEvidenceCount = 0;
for (const evidenceUrl of normalizedEvidenceUrls) {
  if (await checkUrlReachable(evidenceUrl)) {
    reachableEvidenceCount += 1;
  }
}
breakdown.evidenceReachability =
  normalizedEvidenceUrls.length > 0
    ? Math.round((reachableEvidenceCount / normalizedEvidenceUrls.length) * 15)
    : 0;
if (breakdown.evidenceReachability < 15) {
  reasons.push("One or more evidence URLs were unreachable.");
}

let europeanOriginScore = 0;
if (EUROPEAN_COUNTRIES.has(normalizedEntry.country.toLowerCase())) {
  europeanOriginScore += 10;
} else {
  reasons.push("Country is not in the European allowlist.");
}

const websiteTld = topLevelDomain(normalizedEntry.website);
const evidenceHasEuTld = normalizedEvidenceUrls.some((url) => EU_TLDS.has(topLevelDomain(url)));
if (EU_TLDS.has(websiteTld) || evidenceHasEuTld) {
  europeanOriginScore += 5;
}
breakdown.europeanOrigin = europeanOriginScore;

const duplicateId = existingSoftware.some((item) => item.id === normalizedEntry.id);
const incomingHostname = extractHostname(normalizedEntry.website);
const duplicateHostname =
  incomingHostname && existingSoftware.some((item) => item.hostname === incomingHostname);

if (duplicateId) {
  breakdown.duplicateDomain = 0;
  reasons.push("Software ID already exists in the directory.");
} else if (duplicateHostname) {
  breakdown.duplicateDomain = 3;
  reasons.push("Website domain already exists in the directory.");
} else {
  breakdown.duplicateDomain = 10;
}

let contentScore = 10;
if (normalizedEntry.description.length < 30) {
  contentScore -= 2;
}
if (normalizedEntry.longDescription.length < 140) {
  contentScore -= 2;
}
if (normalizedEntry.features.length < 3) {
  contentScore -= 2;
}
if (new Set(normalizedEntry.features.map((feature) => feature.toLowerCase())).size !== normalizedEntry.features.length) {
  contentScore -= 2;
}
if (!normalizedEvidenceUrls.some((url) => /about|company|team|imprint|legal/i.test(url))) {
  contentScore -= 2;
}
breakdown.contentQuality = Math.max(0, contentScore);
if (breakdown.contentQuality < 8) {
  reasons.push("Content quality signals are weak for automatic merge.");
}

const combinedText = [
  normalizedEntry.name,
  normalizedEntry.description,
  normalizedEntry.longDescription,
  normalizedEntry.features.join(" "),
].join(" ").toLowerCase();

let spamScore = 10;
if (SPAM_KEYWORDS.some((keyword) => combinedText.includes(keyword))) {
  spamScore -= 6;
  reasons.push("Spam keyword patterns were detected.");
}
if (/(.)\1{4,}/.test(combinedText)) {
  spamScore -= 2;
}
if ((combinedText.match(/!/g) || []).length > 10) {
  spamScore -= 1;
}
if ((combinedText.match(/[A-Z]{5,}/g) || []).length > 3) {
  spamScore -= 1;
}
breakdown.spamHeuristics = Math.max(0, spamScore);

const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
let decision = "reject";
if (score >= 90) {
  decision = "auto-merge";
} else if (score >= 70) {
  decision = "manual-review";
}

if (decision === "manual-review") {
  reasons.push("Submission requires manual reviewer approval.");
}

const essentialChecks = [
  Boolean(normalizedEntry.id && isSlug(normalizedEntry.id)),
  ALLOWED_CATEGORIES.has(normalizedCategory),
  normalizedEntry.name.length >= 2,
  isUrl(normalizedEntry.website),
  normalizedEvidenceUrls.length >= 1 && normalizedEvidenceUrls.every((url) => isUrl(url)),
  Boolean(targetPath),
];
if (essentialChecks.includes(false)) {
  decision = "reject";
  if (!reasons.includes("Submission failed one or more required schema checks.")) {
    reasons.push("Submission failed one or more required schema checks.");
  }
}

if (decision === "reject" && reasons.length === 0) {
  reasons.push("Submission did not meet moderation thresholds.");
}

const result = {
  score,
  decision,
  reasons,
  breakdown,
  normalizedCategory,
  ...(normalizedLogoUrl ? { submittedLogoUrl: normalizedLogoUrl } : {}),
  ...(normalizedUploadedLogo
    ? { submittedUploadedLogo: normalizedUploadedLogo }
    : {}),
  normalizedEntry,
  ...(targetPath ? { targetPath } : {}),
};

await fs.writeFile(outputFile, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Moderation score ${score} (${decision}) written to ${outputFile}`);
