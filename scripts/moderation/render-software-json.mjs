import fs from "node:fs/promises";
import path from "node:path";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

const inputFile = getArg("--input") || "moderation-score.json";
const SOFTWARE_ROOT = path.resolve("data/software");

function isSlug(value) {
  return /^[a-z0-9-]+$/.test(String(value || ""));
}

const moderationResult = JSON.parse(await fs.readFile(inputFile, "utf8"));
if (!moderationResult?.normalizedEntry) {
  throw new Error("Invalid moderation score input: missing normalizedEntry");
}

const category = String(moderationResult?.normalizedCategory || moderationResult?.normalizedEntry?.category || "");
const id = String(moderationResult?.normalizedEntry?.id || "");

if (!isSlug(category) || !isSlug(id)) {
  throw new Error("Invalid moderation score input: unsafe category or id");
}

const outputPath = path.resolve(SOFTWARE_ROOT, category, `${id}.json`);
if (!outputPath.startsWith(`${SOFTWARE_ROOT}${path.sep}`) || path.extname(outputPath) !== ".json") {
  throw new Error("Refusing to write outside data/software");
}

const outputDir = path.dirname(outputPath);
await fs.mkdir(outputDir, { recursive: true });

const record = {
  id: moderationResult.normalizedEntry.id,
  name: moderationResult.normalizedEntry.name,
  description: moderationResult.normalizedEntry.description,
  category: moderationResult.normalizedEntry.category,
  country: moderationResult.normalizedEntry.country,
  logo: moderationResult.normalizedEntry.logo,
  website: moderationResult.normalizedEntry.website,
  longDescription: moderationResult.normalizedEntry.longDescription,
  features: moderationResult.normalizedEntry.features,
};

await fs.writeFile(outputPath, `${JSON.stringify(record, null, 2)}\n`);
console.log(`Wrote software entry to ${outputPath}`);
