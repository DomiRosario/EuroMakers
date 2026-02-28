/**
 * This script validates all software JSON files against the schema.
 *
 * Run it with:
 * node scripts/validate.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import chalk from "chalk";

// Define dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the software data directory
const softwareDirectory = path.resolve(__dirname, "../data/software");

// Define the schema
const SoftwareSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  country: z.string().min(1, "Country is required"),
  logo: z
    .string()
    .startsWith("/images/", "Logo path should start with /images/"),
  website: z.string().url("Website must be a valid URL"),
  longDescription: z
    .string()
    .min(50, "Long description should be at least 50 characters"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  // Optional fields
  isFeatured: z.boolean().optional(),
  featureReason: z.string().optional(),
  featurePriority: z.number().min(1).max(10).optional(),
});

// Validate a file
function validateSoftwareFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    // Read and parse file
    const fileContents = fs.readFileSync(filePath, "utf8");
    let jsonData;
    try {
      jsonData = JSON.parse(fileContents);
    } catch (e) {
      return { success: false, error: `Invalid JSON in file: ${filePath}` };
    }

    // Validate data
    const result = SoftwareSchema.safeParse(jsonData);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      return { success: false, error: errorMessages };
    }
  } catch (error) {
    return {
      success: false,
      error: `Error validating file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Track statistics
let totalFiles = 0;
let validFiles = 0;
let invalidFiles = 0;

// Error records
const errors = {};

async function validateAllSoftwareFiles() {
  console.log(chalk.bold("\n📋 Validating software JSON files...\n"));

  try {
    // Get all categories
    const categories = fs
      .readdirSync(softwareDirectory)
      .filter((item) =>
        fs.statSync(path.join(softwareDirectory, item)).isDirectory()
      );

    for (const category of categories) {
      console.log(chalk.bold(`\n📁 Category: ${category}`));

      const categoryPath = path.join(softwareDirectory, category);
      const files = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".json"));

      for (const file of files) {
        totalFiles++;
        const filePath = path.join(categoryPath, file);
        const relativePath = path.relative(
          path.resolve(__dirname, ".."),
          filePath
        );

        const result = validateSoftwareFile(filePath);

        if (result.success) {
          validFiles++;
          console.log(chalk.green(`  ✅ ${file} - Valid`));
        } else {
          invalidFiles++;
          console.log(chalk.red(`  ❌ ${file} - Invalid`));
          errors[relativePath] = result.error;
        }
      }
    }

    // Print summary
    console.log(chalk.bold("\n📊 Summary:"));
    console.log(`  Total files: ${totalFiles}`);
    console.log(chalk.green(`  Valid files: ${validFiles}`));

    if (invalidFiles > 0) {
      console.log(chalk.red(`  Invalid files: ${invalidFiles}`));

      console.log(chalk.bold("\n🔍 Validation Errors:"));
      Object.entries(errors).forEach(([file, error]) => {
        console.log(chalk.red(`\n  📄 ${file}:`));
        console.log(`     ${error.split("\n").join("\n     ")}`);
      });

      process.exit(1);
    } else {
      console.log(chalk.green.bold("\n✨ All software files are valid! ✨"));
    }
  } catch (error) {
    console.error(chalk.red("Error validating software files:"), error);
    process.exit(1);
  }
}

validateAllSoftwareFiles();
