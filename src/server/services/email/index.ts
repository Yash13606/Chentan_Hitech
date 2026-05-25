import "server-only";

import { Resend } from "resend";
import { db } from "@/server/db";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM ?? "noreply@chetanhitech.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:system-ui,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <!-- Brand header -->
        <tr>
          <td style="background:#1a1a1a;padding:20px 32px;">
            <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;letter-spacing:-0.5px;">Chetan Hi-Tech</p>
            <p style="margin:4px 0 0;font-size:11px;color:#999999;">Industrial Kitchen &amp; Refrigeration Equipment</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
            <p style="margin:0;font-size:11px;color:#999999;">
              Chetan Hi-Tech Industrial Procurement Platform &bull;
              <a href="${APP_URL}" style="color:#999999;">chetanhitech.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendAndLog(params: {
  to: string;
  subject: string;
  html: string;
  template: string;
}) {
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    await db.emailLog.create({
      data: {
        toEmail: params.to,
        template: params.template,
        status: "SENT",
        providerId: result.data?.id ?? null,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    await db.emailLog.create({
      data: {
        toEmail: params.to,
        template: params.template,
        status: "FAILED",
        error: error instanceof Error ? error.message : String(error),
      },
    });
    // Don't throw — email failure must never break the main flow
    console.error("[email] Failed to send:", params.template, error);
  }
}

// ─────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────

/** Sent when a customer submits an RFQ. */
export async function sendRfqConfirmationEmail(params: {
  toEmail: string;
  customerName: string;
  inquiryNumber: string;
  itemCount: number;
}) {
  const { toEmail, customerName, inquiryNumber, itemCount } = params;

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">RFQ Received</h2>
    <p style="margin:0 0 24px;color:#666;">Hi ${customerName ?? "there"}, your quotation request has been submitted successfully.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:6px;">Reference Number</td>
      </tr>
      <tr>
        <td style="font-size:18px;font-weight:600;font-family:monospace;">${inquiryNumber}</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#666;padding-top:10px;">${itemCount} product${itemCount !== 1 ? "s" : ""} in your RFQ</td>
      </tr>
    </table>

    <p style="color:#444;line-height:1.6;">Our engineering team will review your requirements and respond with an official quotation within <strong>24 hours</strong>.</p>

    <a href="${APP_URL}/portal/quotations" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      Track your inquiry →
    </a>
  `;

  await sendAndLog({
    to: toEmail,
    subject: `RFQ Received — ${inquiryNumber}`,
    html: baseLayout(`RFQ Received — ${inquiryNumber}`, body),
    template: "rfq_confirmation",
  });
}

/** Sent when an admin approves a quotation. */
export async function sendQuotationReadyEmail(params: {
  toEmail: string;
  customerName: string;
  inquiryNumber: string;
  totalCents: number;
  quotationId: string;
}) {
  const { toEmail, customerName, inquiryNumber, totalCents, quotationId } = params;
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalCents / 100);

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">Your Quotation is Ready</h2>
    <p style="margin:0 0 24px;color:#666;">Hi ${customerName ?? "there"}, we've prepared an official quotation for your inquiry.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:4px;">Inquiry</td>
        <td style="font-size:12px;color:#666;padding-bottom:4px;text-align:right;">Quotation Total</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:600;font-family:monospace;">${inquiryNumber}</td>
        <td style="font-size:16px;font-weight:600;text-align:right;">${formattedTotal}</td>
      </tr>
    </table>

    <p style="color:#444;line-height:1.6;">Download your PDF quotation from the customer portal. The download link is valid for <strong>24 hours</strong>.</p>

    <a href="${APP_URL}/portal/quotations" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      Download Quotation PDF →
    </a>

    <p style="margin-top:24px;font-size:12px;color:#999;">If the link expires, log in to your portal and download again from My Quotations.</p>
  `;

  await sendAndLog({
    to: toEmail,
    subject: `Quotation Ready — ${inquiryNumber}`,
    html: baseLayout(`Quotation Ready — ${inquiryNumber}`, body),
    template: "quotation_ready",
  });
}

/** Sent on successful registration. */
export async function sendWelcomeEmail(params: {
  toEmail: string;
  customerName: string;
}) {
  const { toEmail, customerName } = params;

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">Welcome to Chetan Hi-Tech</h2>
    <p style="margin:0 0 20px;color:#666;">Hi ${customerName ?? "there"}, your account is ready.</p>

    <p style="color:#444;line-height:1.6;">You can now:</p>
    <ul style="color:#444;line-height:2;padding-left:20px;">
      <li>Browse our full equipment catalog with pricing</li>
      <li>Add products to your RFQ cart</li>
      <li>Submit quotation requests to our sales team</li>
      <li>Download official PDF quotations from your portal</li>
    </ul>

    <a href="${APP_URL}/catalog" style="display:inline-block;margin-top:20px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      Browse the Catalog →
    </a>
  `;

  await sendAndLog({
    to: toEmail,
    subject: "Welcome to Chetan Hi-Tech",
    html: baseLayout("Welcome to Chetan Hi-Tech", body),
    template: "welcome",
  });
}

/** Sent when a consultation is confirmed by the sales team. */
export async function sendConsultationConfirmedEmail(params: {
  toEmail: string;
  customerName: string;
  consultationType: string;
  confirmedSlot: Date;
  meetingUrl?: string | null;
}) {
  const { toEmail, customerName, consultationType, confirmedSlot, meetingUrl } = params;

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">Consultation Confirmed</h2>
    <p style="margin:0 0 24px;color:#666;">Hi ${customerName ?? "there"}, your consultation has been confirmed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr><td style="font-size:12px;color:#666;padding-bottom:4px;">Type</td></tr>
      <tr><td style="font-size:15px;font-weight:600;padding-bottom:12px;">${consultationType.replace(/_/g, " ")}</td></tr>
      <tr><td style="font-size:12px;color:#666;padding-bottom:4px;">Date &amp; Time</td></tr>
      <tr><td style="font-size:15px;font-weight:600;">${confirmedSlot.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</td></tr>
    </table>

    ${meetingUrl ? `<a href="${meetingUrl}" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">Join Meeting →</a>` : ""}
  `;

  await sendAndLog({
    to: toEmail,
    subject: "Consultation Confirmed — Chetan Hi-Tech",
    html: baseLayout("Consultation Confirmed", body),
    template: "consultation_confirmed",
  });
}
