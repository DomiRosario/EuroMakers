/**
 * This script validates all software JSON files against the schema.
 *
 * Run it with:
 * npx ts-node scripts/validate-software.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateSoftwareFile } from "../app/lib/validation.js";
import chalk from "chalk";

// Define dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the software data directory
const softwareDirectory = path.resolve(__dirname, "../data/software");

// Track statistics
let totalFiles = 0;
let validFiles = 0;
let invalidFiles = 0;

// Error records
const errors: Record<string, string> = {};

async function validateAllSoftwareFiles() {
  console.log(chalk.bold("\n📋 Validating software JSON files...\n"));

  try {
    // Get all categories
    const categories = fs
      .readdirSync(softwareDirectory)
      .filter((item) =>
        fs.statSync(path.join(softwareDirectory, item)).isDirectory(),
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
          filePath,
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
