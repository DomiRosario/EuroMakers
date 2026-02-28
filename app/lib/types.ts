export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  logo: string;
  website: string;
  released: string;
  headquarters: string;
  longDescription: string;
  features: string[];
  // Featured information
  isFeatured?: boolean;
  featureReason?: string; // Why this software is featured
  featurePriority?: number; // 1-10, helps with sorting featured items
}
