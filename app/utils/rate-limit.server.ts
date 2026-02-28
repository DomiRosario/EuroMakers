// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

// In-memory store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

// Helper to get IP address from request
function getIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "127.0.0.1";
}

// Apply rate limiting to a request
export async function applyRateLimit(
  request: Request,
  endpoint: string
): Promise<void> {
  const ip = getIP(request);
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  // Clean old entry if exists
  if (rateLimit.has(key)) {
    const entry = rateLimit.get(key)!;
    if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.delete(key);
    }
  }

  // Check/update rate limit
  if (!rateLimit.has(key)) {
    rateLimit.set(key, { count: 1, timestamp: now });
  } else {
    const current = rateLimit.get(key)!;
    if (current.count >= RATE_LIMIT_MAX) {
      throw new Response("Too many requests", {
        status: 429,
        statusText: "Too Many Requests",
        headers: {
          "Retry-After": String(RATE_LIMIT_WINDOW / 1000),
          "Content-Type": "application/json",
        },
      });
    }
    current.count++;
  }
}
