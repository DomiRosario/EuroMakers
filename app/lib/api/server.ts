import { json } from "@remix-run/node";
import type { APIError } from "./client";
import { sendEmail } from "~/utils/smtp2go.server";

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
