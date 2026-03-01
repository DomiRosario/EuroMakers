import type { Software } from "../types";
import {
  getAllSoftwareServer,
  getAllCountriesServer,
  countSoftwareByCategoryServer,
  getSoftwareByCategoryServer,
} from "../software.server";

export interface SubmitSoftwareData {
  name: string;
  id?: string;
  website: string;
  logoUrl?: string;
  country: string;
  category: string;
  description: string;
  longDescription: string;
  features: string[];
  evidenceUrls: string[];
  submitterEmail: string;
  isEuropean: boolean;
  gdprConsent: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  gdprConsent: boolean;
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

function getBaseUrl(endpoint: string): string {
  if (typeof window !== "undefined") {
    // Client-side
    return `${window.location.origin}${endpoint}`;
  }
  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${endpoint}`;
  }
  return `http://localhost:${process.env.PORT || 5173}${endpoint}`;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = getBaseUrl(endpoint);
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new APIError(response.status, await response.text());
  }

  return response.json();
}

export const api = {
  software: {
    getAll: async () => {
      if (typeof window === "undefined") {
        return getAllSoftwareServer();
      }
      return fetchAPI<Software[]>("/api/software");
    },
    getById: (id: string) => fetchAPI<Software>(`/api/software/${id}`),
    submit: (data: SubmitSoftwareData) =>
      fetchAPI<{ success: boolean }>("/api/software", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getByCategory: async (category: string) => {
      if (typeof window === "undefined") {
        return getSoftwareByCategoryServer(category);
      }
      const allSoftware = await api.software.getAll();
      return allSoftware.filter((s) => s.category === category);
    },
  },
  countries: {
    getAll: async () => {
      if (typeof window === "undefined") {
        return getAllCountriesServer();
      }
      return fetchAPI<string[]>("/api/countries");
    },
    getSoftwareByCountry: async (country: string) => {
      const allSoftware = await api.software.getAll();
      return allSoftware.filter((s) => s.country === country);
    },
  },
  categories: {
    getCounts: async () => {
      if (typeof window === "undefined") {
        return countSoftwareByCategoryServer();
      }
      return fetchAPI<Record<string, number>>("/api/categories/counts");
    },
  },
  contact: {
    submit: (data: ContactFormData) =>
      fetchAPI<{ success: boolean }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
