import { z } from "zod";
import fs from "fs";

/**
 * Zod schema for validating software data
 */
export const SoftwareSchema = z.object({
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

/**
 * Type derived from the software schema
 */
export type ValidatedSoftware = z.infer<typeof SoftwareSchema>;

/**
 * Validates a software object against the schema
 * @param data Unknown data to validate
 * @returns Validated software object
 * @throws ZodError if validation fails
 */
export function validateSoftware(data: unknown): ValidatedSoftware {
  return SoftwareSchema.parse(data);
}

/**
 * Validates a software object against the schema and returns validation result
 * @param data Unknown data to validate
 * @returns Object with success flag and either data or error
 */
export function safetlyValidateSoftware(
  data: unknown,
):
  | { success: true; data: ValidatedSoftware }
  | { success: false; error: z.ZodError } {
  const result = SoftwareSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validates a JSON file against the software schema
 * @param filePath Path to the JSON file
 * @returns Object with success flag and either data or error message
 */
export function validateSoftwareFile(
  filePath: string,
):
  | { success: true; data: ValidatedSoftware }
  | { success: false; error: string } {
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
    } catch {
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
      error: `Error validating file: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
