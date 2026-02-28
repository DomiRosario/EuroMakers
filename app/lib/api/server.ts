import { json } from "@remix-run/node";
import type { APIError } from "./client";
import { sendEmail } from "~/utils/smtp2go.server";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export function handleAPIError(error: unknown) {
  console.error("API Error:", error);

  // Handle SMTP2GO specific errors
  if (error instanceof Error) {
    if (error.message.includes("SMTP2GO credentials are not configured")) {
      return json(
        {
          error:
            "Email service is not properly configured. Please try again later or contact support.",
        },
        { status: 500 },
      );
    }
    if (error.message.includes("SMTP authentication failed")) {
      return json(
        {
          error:
            "Email service authentication failed. Please try again later or contact support.",
        },
        { status: 500 },
      );
    }
    if (error.message.includes("Invalid recipient")) {
      return json(
        {
          error:
            "Invalid email address provided. Please check your email and try again.",
        },
        { status: 400 },
      );
    }
    if (error.message.includes("Rate limit exceeded")) {
      return json(
        {
          error: "Too many requests. Please wait a few minutes and try again.",
        },
        { status: 429 },
      );
    }
  }

  // Handle API errors with status
  if ((error as APIError).status) {
    const apiError = error as APIError;
    return json({ error: apiError.message }, { status: apiError.status });
  }

  // Log the full error for debugging
  console.error("Detailed error:", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    type: error instanceof Error ? error.constructor.name : typeof error,
  });

  return json(
    { error: "An unexpected error occurred. Please try again later." },
    { status: 500 },
  );
}

export const serverApi = {
  turnstile: {
    verify: async (token: string) => {
      // Skip verification in development if no secret key is provided
      if (!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
        console.warn(
          "Cloudflare Turnstile secret key not found - skipping verification in development",
        );
        return { success: true };
      }

      try {
        // Create fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
              response: token,
            }),
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Turnstile API returned ${response.status}: ${response.statusText}`,
          );
        }

        const result = (await response.json()) as TurnstileResponse;

        if (!result.success) {
          console.error(
            "Turnstile verification failed:",
            result["error-codes"],
          );
          throw new Error("Invalid CAPTCHA verification");
        }

        return result;
      } catch (error) {
        if (error instanceof Error) {
          // Handle timeout and network errors more gracefully
          if (
            error.name === "AbortError" ||
            error.message.includes("timeout")
          ) {
            console.error(
              "Turnstile verification timeout - allowing request in development",
            );
            // In development, allow the request to proceed if there's a network issue
            if (process.env.NODE_ENV === "development") {
              return { success: true };
            }
            throw new Error(
              "CAPTCHA verification service is temporarily unavailable. Please try again.",
            );
          }

          if (
            error.message.includes("fetch failed") ||
            error.message.includes("ENOTFOUND")
          ) {
            console.error(
              "Turnstile network error - allowing request in development",
            );
            // In development, allow the request to proceed if there's a network issue
            if (process.env.NODE_ENV === "development") {
              return { success: true };
            }
            throw new Error(
              "CAPTCHA verification service is temporarily unavailable. Please try again.",
            );
          }
        }
        throw error;
      }
    },
  },
  email: {
    send: async (options: {
      to: string;
      subject: string;
      text: string;
      html: string;
      replyTo?: string;
    }) => {
      return sendEmail(options);
    },
  },
};
