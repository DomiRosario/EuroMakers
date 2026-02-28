import {
  getAllSoftwareServer,
  getSoftwareByIdServer,
  getAllCountriesServer,
} from "./software.server";
import { CATEGORIES } from "./categories";

// Define the structure of the raw software data from JSON/server
interface RawSoftware {
  id: string;
  name: string;
  description: string;
  category: string; // This is the category ID string from JSON
  country: string;
  logo: string;
  website: string;
  longDescription: string;
  features: string[];
}

export interface Software {
  id: string;
  name: string;
  description: string;
  categoryId: string; // Was 'category', now stores the ID like "Design" or "artificial-intelligence"
  categoryDisplayName: string; // Stores the display name like "Design & Creative"
  country: string;
  logo: string;
  website: string;
  longDescription: string;
  features: string[];
}

// Helper function to map raw software data (with 'category' as ID) to the new Software interface
export function mapRawSoftwareToSoftware(rawSoftware: RawSoftware): Software {
  const categoryIdFromJson = rawSoftware.category; // This is the category ID string from JSON e.g. "developer-tools"

  // Find the category object by comparing with cat.id
  const categoryObj = CATEGORIES.find(
    (cat) => cat.id.toLowerCase() === categoryIdFromJson?.toLowerCase(),
  );

  if (categoryObj) {
    // If a matching category is found by ID
    return {
      ...rawSoftware,
      categoryId: categoryObj.id, // Use the ID from the found category object (same as categoryIdFromJson)
      categoryDisplayName: categoryObj.name, // Use the name from the found category object for display
    };
  } else {
    // Fallback if no matching category ID is found in CATEGORIES
    // This could happen if the ID in JSON is misspelled or not defined in categories.ts.
    console.warn(
      `Warning: Category ID "${categoryIdFromJson}" from software "${rawSoftware.name}" (ID: ${rawSoftware.id}) was not found in categories.ts. Using the ID as the display name.`,
    );
    return {
      ...rawSoftware,
      categoryId: categoryIdFromJson, // Use the original ID from JSON
      categoryDisplayName: categoryIdFromJson, // Use the ID as fallback display name
    };
  }
}

// Client-side functions that use the API route
export async function getAllSoftware(): Promise<Software[]> {
  if (typeof window === "undefined") {
    const rawSoftwareList = (await getAllSoftwareServer()) as RawSoftware[];
    return rawSoftwareList.map(mapRawSoftwareToSoftware);
  }
  const response = await fetch(`${window.location.origin}/api/software`);
  if (!response.ok) {
    throw new Error("Failed to fetch software data");
  }
  const rawSoftwareList = (await response.json()) as RawSoftware[];
  return rawSoftwareList.map(mapRawSoftwareToSoftware);
}

export async function getSoftwareById(id: string): Promise<Software | null> {
  if (typeof window === "undefined") {
    const rawSoftware = (await getSoftwareByIdServer(id)) as RawSoftware | null;
    return rawSoftware ? mapRawSoftwareToSoftware(rawSoftware) : null;
  }
  const response = await fetch(`${window.location.origin}/api/software/${id}`);
  if (!response.ok) {
    return null;
  }
  const rawSoftware = (await response.json()) as RawSoftware | null;
  return rawSoftware ? mapRawSoftwareToSoftware(rawSoftware) : null;
}

export async function getAllCountries(): Promise<string[]> {
  if (typeof window === "undefined") {
    return getAllCountriesServer();
  }
  const response = await fetch(`${window.location.origin}/api/countries`);
  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }
  return response.json();
}

/**
 * Get software by category
 */
export async function getSoftwareByCategory(
  category: string,
): Promise<Software[]> {
  const allSoftware = await getAllSoftware();
  return allSoftware.filter(
    (software) => software.categoryId.toLowerCase() === category.toLowerCase(),
  );
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<string[]> {
  const allSoftware = await getAllSoftware();
  const categories = new Set(
    allSoftware.map((software) => software.categoryId),
  );
  return Array.from(categories);
}

/**
 * Count software by category
 */
export async function countSoftwareByCategory(): Promise<
  Record<string, number>
> {
  const allSoftware = await getAllSoftware();
  const categoryCounts: Record<string, number> = {};

  allSoftware.forEach((software) => {
    const catId = software.categoryId;
    categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
  });

  return categoryCounts;
}
