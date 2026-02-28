import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/Layout";
import { Turnstile } from "@marsidev/react-turnstile";
import { serverApi, handleAPIError } from "~/lib/api/server";
import { sanitizeText, sanitizeEmail } from "~/utils/sanitize.server";
import { sendEmail } from "~/utils/smtp2go.server";
import { buildSocialMeta } from "~/lib/meta";

interface ActionResponse {
  error?: string;
  success?: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = sanitizeText(formData.get("name") as string);
  const email = sanitizeEmail(formData.get("email") as string);
  const subject = sanitizeText(formData.get("subject") as string);
  const message = sanitizeText(formData.get("message") as string);
  const category = sanitizeText(formData.get("category") as string);
  const turnstileToken = formData.get("cf-turnstile-response");
  const gdprConsent = formData.get("gdprConsent") === "on";

  try {
    // Validate required fields
    if (
      !name ||
      !email ||
      !subject ||
      !message ||
      !category ||
      !turnstileToken ||
      !gdprConsent
    ) {
      return json<ActionResponse>(
        { error: "All fields are required and must be valid" },
        { status: 400 },
      );
    }

    // Verify Turnstile token first since it's quick
    await serverApi.turnstile.verify(turnstileToken as string);

    // Prepare email content
    const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Category: ${category}
Subject: ${subject}

Message:
${message}
    `.trim();

    const emailHtml = `
<h2>New Contact Form Submission</h2>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Category:</strong> ${category}</p>
<p><strong>Subject:</strong> ${subject}</p>

<h3>Message:</h3>
<p>${message.replace(/\n/g, "<br>")}</p>
    `.trim();

    // Send email
    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || "contact@euromakers.org",
        subject: `[Contact Form] ${subject}`,
        text: emailText,
        html: emailHtml,
        replyTo: email,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      return json<ActionResponse>(
        { error: "Failed to send contact email. Please try again." },
        { status: 500 },
      );
    }

    return redirect("/contact/success");
  } catch (error) {
    return handleAPIError(error);
  }
}

export const meta: MetaFunction = () =>
  buildSocialMeta({
    title: "Contact EuroMakers",
    description:
      "Get in touch with the EuroMakers team for support, partnerships, updates, or feedback.",
    path: "/contact",
  });

export default function ContactPage() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const actionData = useActionData<ActionResponse>();

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const isValid = form.checkValidity() && Boolean(turnstileToken);
    setIsFormValid(isValid);
  };

  return (
    <Layout>
      <main className="overflow-x-hidden w-full">
        <section className="eu-section bg-gradient-to-b from-euBlue/10 to-white">
          <div className="eu-container max-w-3xl px-4 sm:px-6">
            <div className="page-header-section text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Have a question or feedback? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {"error" in (actionData || {}) && (
                <div className="p-4 bg-red-50 border-b border-red-100 text-red-600">
                  {actionData?.error}
                </div>
              )}
              {"success" in (actionData || {}) && (
                <div className="p-4 bg-green-50 border-b border-green-100 text-green-600">
                  Your message has been sent successfully! We&apos;ll get back
                  to you soon.
                </div>
              )}

              <Form
                method="post"
                className="divide-y divide-gray-100"
                onChange={handleFormChange}
              >
                {/* Contact Form Section */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label htmlFor="name" className="label">
                        <span className="label-text font-medium text-gray-700">
                          Your Name
                        </span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        className="input input-bordered w-full bg-gray-50/50 focus:bg-white transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label htmlFor="email" className="label">
                        <span className="label-text font-medium text-gray-700">
                          Email Address
                        </span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className="input input-bordered w-full bg-gray-50/50 focus:bg-white transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label htmlFor="category" className="label">
                        <span className="label-text font-medium text-gray-700">
                          Category
                        </span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        className="select select-bordered w-full bg-gray-50/50 focus:bg-white transition-colors"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        <option value="General">General Inquiry</option>
                        <option value="Support">Technical Support</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Update">Update Product</option>
                        <option value="Bug">Bug Report</option>
                        <option value="Feature">Feature Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label htmlFor="subject" className="label">
                        <span className="label-text font-medium text-gray-700">
                          Subject
                        </span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        className="input input-bordered w-full bg-gray-50/50 focus:bg-white transition-colors"
                        placeholder="What is your message about?"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label htmlFor="message" className="label">
                      <span className="label-text font-medium text-gray-700">
                        Message
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className="textarea textarea-bordered w-full bg-gray-50/50 focus:bg-white transition-colors"
                      placeholder="Write your message here..."
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Verification Section */}
                <div className="p-6 md:p-8 space-y-6 bg-white">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="form-control">
                        <label
                          htmlFor="gdprConsent"
                          className="cursor-pointer flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/30 hover:bg-gray-50/50 transition-all duration-300"
                        >
                          <input
                            id="gdprConsent"
                            type="checkbox"
                            name="gdprConsent"
                            className="checkbox"
                            required
                          />
                          <span className="text-sm text-gray-600">
                            I consent to the processing of my data according to
                            the{" "}
                            <a
                              href="/privacy"
                              className="text-euBlue hover:underline"
                            >
                              privacy policy
                            </a>
                            .
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-center md:justify-end">
                      <Turnstile
                        siteKey="0x4AAAAAABAgVA930JNOQMwm"
                        onSuccess={setTurnstileToken}
                        options={{
                          theme: "light",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className={`btn w-full disabled:cursor-not-allowed ${
                        isFormValid
                          ? "btn-primary bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white border-none"
                          : "bg-gray-100 hover:bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                      disabled={!isFormValid}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
