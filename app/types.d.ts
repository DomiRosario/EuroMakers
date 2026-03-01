declare global {
  interface Window {
    ENV?: {
      MAINTENANCE_MODE?: string;
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
