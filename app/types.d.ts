declare global {
  interface Window {
    ENV?: {
      MAINTENANCE_MODE?: string;
      CLOUDFLARE_TURNSTILE_SITE_KEY?: string;
      POSTHOG_KEY?: string;
      POSTHOG_HOST?: string;
      BRANDFETCH_CLIENT_ID?: string;
    };
  }
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  logo: string;
  website: string;
  longDescription: string;
  features: string[];
}

export {};
