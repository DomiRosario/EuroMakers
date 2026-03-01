import sanitizeHtmlLib from "sanitize-html";

const PLAIN_TEXT_SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

const RICH_TEXT_SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ["b", "i", "em", "strong", "a", "p", "br"],
  allowedAttributes: {
    a: ["href"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
};

// Basic text sanitization for general inputs
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtmlLib(input.trim(), PLAIN_TEXT_SANITIZE_OPTIONS);
}

// URL sanitization
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const sanitized = sanitizeText(url);
  try {
    const urlObj = new URL(sanitized);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return "";
    }
    return urlObj.toString();
  } catch {
    return "";
  }
}

// Email sanitization
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return "";
  const sanitized = sanitizeText(email);
  // Basic email format validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized) ? sanitized : "";
}

// HTML content sanitization (for rich text)
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html.trim(), RICH_TEXT_SANITIZE_OPTIONS);
}

// Sanitize object keys and values
export function sanitizeObject<T extends { [key: string]: unknown }>(
  obj: T,
): T {
  const sanitized = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  return sanitized;
}
