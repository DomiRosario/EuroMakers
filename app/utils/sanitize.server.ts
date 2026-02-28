import DOMPurify from "isomorphic-dompurify";

// Basic text sanitization for general inputs
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
}

// URL sanitization
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const sanitized = DOMPurify.sanitize(url.trim());
  try {
    const urlObj = new URL(sanitized);
    return urlObj.toString(); // Use the normalized URL string
  } catch {
    return "";
  }
}

// Email sanitization
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return "";
  const sanitized = DOMPurify.sanitize(email.trim(), { ALLOWED_TAGS: [] });
  // Basic email format validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized) ? sanitized : "";
}

// HTML content sanitization (for rich text)
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html.trim(), {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href"],
  });
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
