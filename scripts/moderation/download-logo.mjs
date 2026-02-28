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

const inputFile = getArg("--input") || "moderation-score.json";
const outputFile = getArg("--output") || inputFile;
const imagesDir = getArg("--images-dir") || "public/images";
const maxBytes = Number.parseInt(getArg("--max-bytes") || "", 10) || 4 * 1024 * 1024;

const MIME_EXTENSION_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/gif": "gif",
};

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg", "ico", "gif"]);
const ALLOWED_ID_PATTERN = /^[a-z0-9-]+$/;
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "169.254.169.254",
  "0.0.0.0",
]);

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function normalizeExtension(ext) {
  const cleaned = String(ext || "")
    .toLowerCase()
    .replace(/^\./, "");
  if (cleaned === "jpeg") {
    return "jpg";
  }
  return cleaned;
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
    throw new Error("Only http/https logo URLs are allowed");
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname || isBlockedHostname(hostname)) {
    throw new Error("Blocked hostname in logo URL");
  }

  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error("Blocked private or loopback IP address");
    }
    return;
  }

  const resolved = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!resolved.length) {
    throw new Error("Unable to resolve logo hostname");
  }
  for (const record of resolved) {
    if (isPrivateAddress(record.address)) {
      throw new Error("Blocked private or loopback DNS resolution result");
    }
  }
}

async function fetchWithSafeRedirects(inputUrl, options) {
  const maxRedirects = 4;
  let currentUrl = inputUrl;

  for (let i = 0; i <= maxRedirects; i += 1) {
    await assertSafeRemoteUrl(currentUrl);
    const response = await fetch(currentUrl, {
      ...options,
      redirect: "manual",
    });

    const isRedirect = response.status >= 300 && response.status < 400;
    const location = response.headers.get("location");
    if (!isRedirect || !location) {
      return response;
    }

    currentUrl = new URL(location, currentUrl).toString();
  }

  throw new Error("Too many redirects while downloading logo");
}

function extensionFromUrl(url) {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname);
    return normalizeExtension(ext);
  } catch {
    return "";
  }
}

function ensureGeneratedAssets(result) {
  if (!Array.isArray(result.generatedAssets)) {
    result.generatedAssets = [];
  }
  return result.generatedAssets;
}

async function writeResult(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function persistLogo({
  moderationResult,
  entry,
  imagesDir,
  extension,
  buffer,
  outputFile,
}) {
  if (!ALLOWED_ID_PATTERN.test(String(entry.id || ""))) {
    throw new Error("Invalid entry id for logo output path");
  }
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported logo image extension: ${extension || "unknown"}`);
  }
  if (buffer.length === 0) {
    throw new Error("Downloaded file is empty");
  }
  if (buffer.length > maxBytes) {
    throw new Error(`Downloaded file exceeds max size (${maxBytes} bytes)`);
  }

  const outputFileName = `${entry.id}_icon.${extension}`;
  const imagesRoot = path.resolve(imagesDir);
  const outputPath = path.resolve(imagesRoot, outputFileName);
  if (!outputPath.startsWith(`${imagesRoot}${path.sep}`)) {
    throw new Error("Refusing to write logo outside images directory");
  }
  await fs.mkdir(imagesRoot, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  entry.logo = `/images/${outputFileName}`;
  const generatedAssets = ensureGeneratedAssets(moderationResult);
  const generatedPath = path.posix.join("public/images", outputFileName);
  if (!generatedAssets.includes(generatedPath)) {
    generatedAssets.push(generatedPath);
  }

  await writeResult(outputFile, moderationResult);
  return generatedPath;
}

const moderationResult = JSON.parse(await fs.readFile(inputFile, "utf8"));
if (!moderationResult?.normalizedEntry?.id || !moderationResult?.normalizedEntry) {
  throw new Error("Invalid moderation score input: missing normalizedEntry");
}

const entry = moderationResult.normalizedEntry;
const submittedLogo = String(
  moderationResult.submittedLogoUrl || entry.logo || "",
).trim();
const submittedUploadedLogo =
  moderationResult.submittedUploadedLogo &&
  typeof moderationResult.submittedUploadedLogo === "object"
    ? moderationResult.submittedUploadedLogo
    : null;

if (submittedUploadedLogo?.mimeType && submittedUploadedLogo?.dataBase64) {
  try {
    const extension = normalizeExtension(
      MIME_EXTENSION_MAP[String(submittedUploadedLogo.mimeType).toLowerCase()] || "",
    );
    const buffer = Buffer.from(String(submittedUploadedLogo.dataBase64), "base64");
    const generatedPath = await persistLogo({
      moderationResult,
      entry,
      imagesDir,
      extension,
      buffer,
      outputFile,
    });
    console.log(`Stored uploaded logo to ${generatedPath}`);
    process.exit(0);
  } catch (error) {
    entry.logo = "/images/placeholder.svg";
    await writeResult(outputFile, moderationResult);
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Uploaded logo processing failed; using placeholder logo: ${message}`);
    process.exit(0);
  }
}

if (!isRemoteUrl(submittedLogo)) {
  await writeResult(outputFile, moderationResult);
  console.log("No remote logo URL found. Skipped logo download.");
  process.exit(0);
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);

try {
  const response = await fetchWithSafeRedirects(submittedLogo, {
    method: "GET",
    signal: controller.signal,
    headers: {
      "User-Agent": "euromakers-moderation-bot",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
  const extensionFromMime = normalizeExtension(MIME_EXTENSION_MAP[contentType] || "");
  const extension = extensionFromMime || extensionFromUrl(submittedLogo);
  const buffer = Buffer.from(await response.arrayBuffer());
  const generatedPath = await persistLogo({
    moderationResult,
    entry,
    imagesDir,
    extension,
    buffer,
    outputFile,
  });
  console.log(`Downloaded logo to ${generatedPath}`);
} catch (error) {
  entry.logo = "/images/placeholder.svg";
  await writeResult(outputFile, moderationResult);
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Logo download failed; using placeholder logo: ${message}`);
} finally {
  clearTimeout(timeout);
}
