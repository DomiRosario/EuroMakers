import nodemailer from 'nodemailer';

const SMTP2GO_USERNAME = process.env.SMTP2GO_USERNAME || "";
const SMTP2GO_PASSWORD = process.env.SMTP2GO_PASSWORD || "";
const SMTP2GO_FROM_EMAIL = process.env.SMTP2GO_FROM_EMAIL || "contact@euromakers.org";
// Name to display in email clients
const SMTP2GO_FROM_NAME = "EuroMakers";

if (!SMTP2GO_USERNAME) {
    console.error("SMTP2GO username is not set");
}

if (!SMTP2GO_PASSWORD) {
    console.error("SMTP2GO password is not set");
}

if (!SMTP2GO_FROM_EMAIL) {
    console.error("SMTP2GO sender email is not configured");
}

// Log configuration (without exposing credentials)
console.log("SMTP2GO Configuration:", {
    hasUsername: Boolean(SMTP2GO_USERNAME),
    hasPassword: Boolean(SMTP2GO_PASSWORD),
    fromEmail: SMTP2GO_FROM_EMAIL,
});

// Create transporter
const transporter = nodemailer.createTransport({
    host: "mail-eu.smtp2go.com",
    port: 2525,
    secure: false,
    auth: {
        user: SMTP2GO_USERNAME,
        pass: SMTP2GO_PASSWORD
    }
} as nodemailer.TransportOptions);

// Avoid network checks at process boot; verify happens naturally on first send.

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
}

export async function sendEmail({
    to,
    subject,
    text,
    html,
    replyTo,
}: SendEmailParams) {
    try {
        if (!SMTP2GO_USERNAME || !SMTP2GO_PASSWORD) {
            throw new Error("SMTP2GO credentials are not configured. Please check your environment variables.");
        }

        if (!SMTP2GO_FROM_EMAIL) {
            throw new Error("SMTP2GO sender email is not configured");
        }

        const msg = {
            to: to.trim(),
            from: {
                name: SMTP2GO_FROM_NAME,
                address: SMTP2GO_FROM_EMAIL
            },
            subject,
            text,
            html: html || text,
            ...(replyTo ? { replyTo: replyTo.trim() } : {}),
        };

        console.log("Attempting to send email:", {
            to: msg.to,
            from: msg.from,
            subject: msg.subject,
            hasText: Boolean(msg.text),
            hasHtml: Boolean(msg.html),
            hasReplyTo: Boolean(msg.replyTo)
        });

        const response = await transporter.sendMail(msg);
        console.log("SMTP2GO success response:", response);
        return { success: true, response };
    } catch (error) {
        // Enhanced error logging with more specific messages
        console.error("SMTP2GO detailed error:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            errorObject: error,
            emailConfig: {
                host: "mail-eu.smtp2go.com",
                port: 2525,
                secure: false,
                hasCredentials: Boolean(SMTP2GO_USERNAME && SMTP2GO_PASSWORD),
                fromEmail: SMTP2GO_FROM_EMAIL,
                fromName: SMTP2GO_FROM_NAME
            }
        });

        if (error instanceof Error) {
            if (error.message.includes("ECONNREFUSED")) {
                throw new Error("Failed to connect to SMTP server. Please check your network connection and firewall settings.");
            }
            if (error.message.includes("Invalid login") || error.message.includes("authentication failed")) {
                throw new Error("SMTP authentication failed. Please check your SMTP2GO username and password.");
            }
            if (error.message.includes("Invalid recipient")) {
                throw new Error("Invalid recipient email address. Please check the email address format.");
            }
            if (error.message.includes("getaddrinfo")) {
                throw new Error("DNS lookup failed. Please check your SMTP server hostname.");
            }
            // Throw a generic but informative error for other cases
            throw new Error(`Email sending failed: ${error.message}. Please check your SMTP configuration and try again.`);
        }

        throw new Error("An unexpected error occurred while sending the email. Please try again later.");
    }
} 
