import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { safetlyValidateSoftware } from "./validation.js";

// Define dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the software data directory
const softwareDirectory = path.resolve(__dirname, "../../data/software");

// Define the Software interface as it's expected by mapRawSoftwareToSoftware (like RawSoftware in software.ts)
// This represents the data structure after being read from JSON and before full mapping.
interface ServerRawSoftware {
  id: string;
  name: string;
  description: string;
  category: string; // This will be overwritten by the folder name
  country: string;
  logo: string;
  website: string;
  longDescription: string;
  features: string[];
  // Explicitly make optional fields that might not be in all JSONs
  // or are not part of the core schema used by mapRawSoftwareToSoftware's input.
  // released?: string; // Not in RawSoftware or ValidatedSoftware
  // headquarters?: string; // Not in RawSoftware or ValidatedSoftware
}

// This is the existing server-side specific Software type, which might be used elsewhere or could be refactored.
// For now, we ensure that functions returning data for mapRawSoftwareToSoftware use ServerRawSoftware or compatible.
export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  logo: string;
  website: string;
  released: string; // This field causes the conflict if JSON doesn't have it
  headquarters: string; // This field also causes conflict
  longDescription: string;
  features: string[];
}

/**
 * Get all software data
 */
export async function getAllSoftwareServer(): Promise<ServerRawSoftware[]> {
  try {
    const allSoftware: ServerRawSoftware[] = [];
    const validationErrors: Array<{ file: string; errors: string[] }> = [];

    const categoryFolders = fs
      .readdirSync(softwareDirectory)
      .filter((item) =>
        fs.statSync(path.join(softwareDirectory, item)).isDirectory(),
      );

    for (const categoryFolderName of categoryFolders) {
      const categoryPath = path.join(softwareDirectory, categoryFolderName);
      const files = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".json"));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const fileContents = fs.readFileSync(filePath, "utf8");

        try {
          const jsonData = JSON.parse(fileContents);
          const validationResult = safetlyValidateSoftware(jsonData);

          if (validationResult.success) {
            allSoftware.push({
              ...validationResult.data,
              category: categoryFolderName, // Inject folder name as category ID
            });
          } else {
            const errors = validationResult.error.errors.map(
              (err) => `${err.path.join(".")}: ${err.message}`,
            );
            validationErrors.push({
              file: `${categoryFolderName}/${file}`,
              errors,
            });
            // Push raw JSON data with injected category on validation error,
            // ensuring it fits ServerRawSoftware structure as best as possible.
            // This might need careful handling if jsonData can be wildly different.
            const rawDataFallback: ServerRawSoftware = {
              id: jsonData.id || file.replace(".json", ""), // Fallback ID
              name: jsonData.name || "Unknown Name",
              description: jsonData.description || "No description",
              category: categoryFolderName, // Inject folder name
              country: jsonData.country || "Unknown Country",
              logo: jsonData.logo || "",
              website: jsonData.website || "",
              longDescription: jsonData.longDescription || "",
              features: jsonData.features || [],
            };
            allSoftware.push(rawDataFallback);
          }
        } catch (parseError) {
          console.error(
            `Error parsing JSON in file ${categoryFolderName}/${file}:`,
            parseError,
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      console.warn("Software validation errors detected:");
      validationErrors.forEach(({ file, errors }) => {
        console.warn(`  File: ${file}`);
        errors.forEach((err) => console.warn(`    - ${err}`));
      });
    }

    return allSoftware;
  } catch (error) {
    console.error("Error in getAllSoftwareServer:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return [];
  }
}

/**
 * Get software by ID
 */
export async function getSoftwareByIdServer(
  id: string,
): Promise<ServerRawSoftware | null> {
  try {
    const categoryFolders = fs
      .readdirSync(softwareDirectory)
      .filter((item) =>
        fs.statSync(path.join(softwareDirectory, item)).isDirectory(),
      );

    for (const categoryFolderName of categoryFolders) {
      const filePath = path.join(
        softwareDirectory,
        categoryFolderName,
        `${id}.json`,
      );
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, "utf8");
        try {
          const jsonData = JSON.parse(fileContents);
          const validationResult = safetlyValidateSoftware(jsonData);

          // Regardless of validation, inject category from folder and return ServerRawSoftware compatible object
          let softwareData: Omit<ServerRawSoftware, "category">;

          if (validationResult.success) {
            softwareData = validationResult.data;
          } else {
            const errors = validationResult.error.errors.map(
              (err) => `${err.path.join(".")}: ${err.message}`,
            );
            console.warn(
              `Validation errors in ${id}.json (in folder ${categoryFolderName}):`,
            );
            errors.forEach((err) => console.warn(`  - ${err}`));
            // Fallback for unvalidated data
            softwareData = {
              id: jsonData.id || id,
              name: jsonData.name || "Unknown Name",
              description: jsonData.description || "No description",
              country: jsonData.country || "Unknown Country",
              logo: jsonData.logo || "",
              website: jsonData.website || "",
              longDescription: jsonData.longDescription || "",
              features: jsonData.features || [],
            };
          }

          return {
            ...softwareData,
            category: categoryFolderName, // Inject folder name as category ID
          };
        } catch (parseError) {
          console.error(
            `Error parsing JSON in file ${id}.json (in folder ${categoryFolderName}):`,
            parseError,
          );
          // Potentially return a fallback with category still, if ID is known
          return {
            id: id,
            name: "Error Parsing Data",
            description: "Could not parse software data.",
            category: categoryFolderName,
            country: "",
            logo: "",
            website: "",
            longDescription: "",
            features: [],
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error in getSoftwareByIdServer:", error);
    return null;
  }
}

/**
 * Get all unique countries from software list
 */
export async function getAllCountriesServer(): Promise<string[]> {
  const allSoftware = await getAllSoftwareServer();
  const countries = new Set(allSoftware.map((software) => software.country));
  return Array.from(countries);
}

/**
 * Count software by category
 */
export async function countSoftwareByCategoryServer(): Promise<
  Record<string, number>
> {
  const allSoftware = await getAllSoftwareServer(); // Returns ServerRawSoftware[]
  const categoryCounts: Record<string, number> = {};

  allSoftware.forEach((software) => {
    // software.category is now the folder name, which should be the ID
    const catId = software.category;
    categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
  });

  return categoryCounts;
}

/**
 * Get software by category
 */
export async function getSoftwareByCategoryServer(
  category: string, // This should be the category ID (folder name)
): Promise<ServerRawSoftware[]> {
  try {
    const normalizedCategory = category // Assuming category param is already the folder name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-"); // This normalization might still be useful if input isn't clean

    const categoryPath = path.join(softwareDirectory, normalizedCategory);

    if (
      !fs.existsSync(categoryPath) ||
      !fs.statSync(categoryPath).isDirectory()
    ) {
      return [];
    }

    const files = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith(".json"));

    const softwareList: ServerRawSoftware[] = [];
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      try {
        const jsonData = JSON.parse(fileContents);
        const validationResult = safetlyValidateSoftware(jsonData);

        if (validationResult.success) {
          softwareList.push({
            ...validationResult.data,
            category: normalizedCategory, // The folder name is the category
          });
        } else {
          // Handle validation failure for individual file if needed, e.g., log and skip or add with fallbacks
          console.warn(
            `Validation failed for ${file} in category ${normalizedCategory}.`,
          );
          const fallbackData: ServerRawSoftware = {
            id: jsonData.id || file.replace(".json", ""),
            name: jsonData.name || "Invalid Data",
            description: jsonData.description || "",
            category: normalizedCategory,
            country: jsonData.country || "",
            logo: jsonData.logo || "",
            website: jsonData.website || "",
            longDescription: jsonData.longDescription || "",
            features: jsonData.features || [],
          };
          softwareList.push(fallbackData);
        }
      } catch (parseError) {
        console.error(
          `Error parsing ${file} in category ${normalizedCategory}:`,
          parseError,
        );
      }
    }
    return softwareList;
  } catch (error) {
    console.error(
      `Error in getSoftwareByCategoryServer for category ${category}:`,
      error,
    );
    return [];
  }
}
