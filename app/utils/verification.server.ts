// In-memory store for verification codes
// In a production environment, you'd want to use Redis or similar
const verificationCodes = new Map<string, { code: string; expires: number }>();

// Generate a random 6-digit code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired codes (older than 10 minutes)
export function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expires < now) {
      verificationCodes.delete(email);
    }
  }
}

// Store a verification code for an email
export function storeVerificationCode(email: string, code: string) {
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiration
  });
  cleanupExpiredCodes();
}

// Verify a code for an email
export function verifyCode(email: string, code: string): boolean {
  const storedData = verificationCodes.get(email);

  if (!storedData || storedData.expires < Date.now()) {
    return false;
  }

  if (storedData.code !== code) {
    return false;
  }

  // Code is valid, clean it up
  verificationCodes.delete(email);
  return true;
}

// Check if a code has expired
export function isCodeExpired(email: string): boolean {
  const storedData = verificationCodes.get(email);
  return !storedData || storedData.expires < Date.now();
}
