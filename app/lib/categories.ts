import {
  FaTasks,
  FaComments,
  FaCode,
  FaShieldAlt,
  FaCloud,
  FaPaintBrush,
  FaFileAlt,
  FaChartBar,
  FaMoneyBillWave,
  FaGlobe,
  FaSearch,
  FaBullhorn,
  FaGamepad,
  FaWallet,
} from "react-icons/fa";
import { BiBrain } from "react-icons/bi";
import type { IconType } from "react-icons";

// Define category type
export interface Category {
  id: string;
  name: string;
  description: string;
}

// Map of category IDs to their icons
export const CATEGORY_ICONS: Record<string, IconType> = {
  "artificial-intelligence": BiBrain,
  cloud: FaCloud,
  communication: FaComments,
  design: FaPaintBrush,
  "developer-tools": FaCode,
  entertainment: FaGamepad,
  finance: FaMoneyBillWave,
  office: FaFileAlt,
  "personal-finances": FaWallet,
  productivity: FaTasks,
  "search-engine": FaSearch,
  security: FaShieldAlt,
  "web-analytics": FaChartBar,
  "web-browsers": FaGlobe,
  marketing: FaBullhorn,
};

// Predefined list of categories with their descriptions
export const CATEGORIES: Category[] = [
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    description:
      "AI-powered software solutions including language models, machine learning tools, and intelligent assistants.",
  },
  {
    id: "cloud",
    name: "Cloud & Infrastructure",
    description:
      "Cloud hosting, servers, infrastructure as a service, and related solutions.",
  },
  {
    id: "marketing",
    name: "Marketing",
    description:
      "Marketing automation, analytics, and campaign management tools for digital marketing and advertising.",
  },
  {
    id: "productivity",
    name: "Productivity",
    description:
      "Tools that help you work more efficiently, including task managers, note-taking apps, and calendars.",
  },
  {
    id: "communication",
    name: "Communication",
    description:
      "Software for messaging, video conferencing, email, and other forms of communication.",
  },
  {
    id: "design",
    name: "Design & Creative",
    description:
      "Tools for graphic design, image editing, 3D modeling, and other creative work.",
  },
  {
    id: "developer-tools",
    name: "Developer Tools",
    description:
      "Tools for software development, including IDEs, code editors, version control, and APIs.",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description:
      "Entertainment and media software including games, streaming platforms, and multimedia applications.",
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    description:
      "Financial management, accounting, invoicing, and payment processing software.",
  },
  {
    id: "office",
    name: "Office Software",
    description:
      "Word processing, spreadsheets, presentation tools, and other office productivity applications.",
  },
  {
    id: "personal-finances",
    name: "Personal Finances",
    description:
      "Personal finance management tools for budgeting, expense tracking, and financial planning.",
  },
  {
    id: "search-engine",
    name: "Search Engine",
    description:
      "Privacy-focused search engines and alternative search solutions developed in Europe.",
  },
  {
    id: "security",
    name: "Security",
    description:
      "Software focused on privacy, encryption, password management, and security solutions.",
  },
  {
    id: "web-analytics",
    name: "Web Analytics",
    description:
      "Tools for website analytics, visitor tracking, and monitoring user behavior.",
  },
  {
    id: "web-browsers",
    name: "Web Browsers",
    description:
      "Web browsers focused on privacy, security, and enhanced user experience for browsing the internet.",
  },
];
