import { json, type ActionFunctionArgs } from "@remix-run/node";
import { sendEmail } from "~/utils/smtp2go.server";
import { sanitizeText, sanitizeEmail } from "~/utils/sanitize.server";
import type { ContactFormData } from "~/lib/api/client";
import { applyRateLimit } from "~/utils/rate-limit.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Apply rate limiting for form submissions
    await applyRateLimit(request, "api.contact");

    const data = (await request.json()) as ContactFormData;
    const { name, email, subject, message, category } = data;

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
      return json({ error: "All fields are required" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedSubject = sanitizeText(subject);
    const sanitizedMessage = sanitizeText(message);
    const sanitizedCategory = sanitizeText(category);

    // Prepare email content
    const emailText = `
New Contact Form Submission

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Category: ${sanitizedCategory}
Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}
    `.trim();

    const emailHtml = `
<h2>New Contact Form Submission</h2>

<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${sanitizedEmail}</p>
<p><strong>Category:</strong> ${sanitizedCategory}</p>
<p><strong>Subject:</strong> ${sanitizedSubject}</p>

<h3>Message:</h3>
<p>${sanitizedMessage.replace(/\n/g, "<br>")}</p>
    `.trim();

    // Send email using SendGrid
    await sendEmail({
      to: process.env.CONTACT_EMAIL || "contact@euromakers.org",
      subject: `[Contact Form] ${sanitizedSubject}`,
      text: emailText,
      html: emailHtml,
      replyTo: sanitizedEmail,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return json(
        { error: "Too many requests, please try again later" },
        { status: 429 },
      );
    }
    return json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
