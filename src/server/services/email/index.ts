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

/** Sent to the customer the moment they generate a quotation from the cart. */
export async function sendQuotationReadyEmail(params: {
  toEmail: string;
  customerName: string;
  inquiryNumber: string;
  totalCents: number;
  quotationId: string;
}) {
  const { toEmail, customerName, inquiryNumber, totalCents } = params;
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalCents / 100);

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">Your Indicative Quotation</h2>
    <p style="margin:0 0 24px;color:#666;">Hi ${customerName ?? "there"}, here is your indicative quotation based on current catalog pricing.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:4px;">Reference</td>
        <td style="font-size:12px;color:#666;padding-bottom:4px;text-align:right;">Indicative Total</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:600;font-family:monospace;">${inquiryNumber}</td>
        <td style="font-size:16px;font-weight:600;text-align:right;">${formattedTotal}</td>
      </tr>
    </table>

    <p style="color:#444;line-height:1.6;">
      The attached PDF reflects our standard catalog pricing. Volume discounts, custom
      configurations, and final delivery terms are confirmed during a brief discussion
      with our team.
    </p>

    <p style="color:#444;line-height:1.6;margin-top:16px;">
      <strong>Ready to finalize?</strong> Click the button below in your portal to request
      a meeting with our sales engineers — we'll work out the final price and confirm delivery.
    </p>

    <a href="${APP_URL}/portal/quotations" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      View Quotation & Request Meeting →
    </a>

    <p style="margin-top:24px;font-size:12px;color:#999;">
      PDF download link is valid for 24 hours. Log in to your portal to regenerate it anytime.
    </p>
  `;

  await sendAndLog({
    to: toEmail,
    subject: `Indicative Quotation — ${inquiryNumber}`,
    html: baseLayout(`Indicative Quotation — ${inquiryNumber}`, body),
    template: "quotation_ready",
  });
}

/** Sent to admin(s) every time a customer generates an instant quotation. */
export async function sendQuotationToAdminEmail(params: {
  toEmails: string[];
  inquiryNumber: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  totalCents: number;
  itemCount: number;
  quotationId: string;
  inquiryId: string;
}) {
  const {
    toEmails,
    inquiryNumber,
    customerName,
    customerEmail,
    companyName,
    totalCents,
    itemCount,
    inquiryId,
  } = params;

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalCents / 100);

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">New Quotation Generated</h2>
    <p style="margin:0 0 24px;color:#666;">A customer has generated an indicative quotation. Review the details below.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:4px;">Reference</td>
        <td style="font-size:12px;color:#666;padding-bottom:4px;text-align:right;">Total</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:600;font-family:monospace;padding-bottom:12px;">${inquiryNumber}</td>
        <td style="font-size:16px;font-weight:600;text-align:right;padding-bottom:12px;">${formattedTotal}</td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:1px solid #e5e5e5;padding-top:12px;font-size:13px;color:#444;">
          <strong>${customerName}</strong> &middot; ${customerEmail}<br/>
          <span style="color:#666;">${companyName}</span>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:8px;font-size:12px;color:#666;">
          ${itemCount} line item${itemCount !== 1 ? "s" : ""}
        </td>
      </tr>
    </table>

    <a href="${APP_URL}/admin/inquiries/${inquiryId}" style="display:inline-block;margin-top:8px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      View Inquiry →
    </a>
    <a href="${APP_URL}/admin/quotations" style="display:inline-block;margin-top:8px;margin-left:8px;border:1px solid #1a1a1a;color:#1a1a1a;text-decoration:none;padding:9px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      All Quotations
    </a>
  `;

  for (const toEmail of toEmails) {
    await sendAndLog({
      to: toEmail,
      subject: `New Quotation — ${inquiryNumber} · ${formattedTotal}`,
      html: baseLayout(`New Quotation — ${inquiryNumber}`, body),
      template: "quotation_admin_copy",
    });
  }
}

/** Sent to admin(s) when a customer requests a meeting to finalize a quotation. */
export async function sendMeetingRequestEmail(params: {
  toEmails: string[];
  inquiryNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  companyName: string;
  totalCents: number;
  inquiryId: string;
}) {
  const {
    toEmails,
    inquiryNumber,
    customerName,
    customerEmail,
    customerPhone,
    companyName,
    totalCents,
    inquiryId,
  } = params;

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalCents / 100);

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#b45309;">🤝 Meeting Requested</h2>
    <p style="margin:0 0 24px;color:#666;">A customer wants to discuss finalising their quotation. Please reach out.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fbbf24;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:4px;">Reference</td>
        <td style="font-size:12px;color:#666;padding-bottom:4px;text-align:right;">Quotation Total</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:600;font-family:monospace;padding-bottom:12px;">${inquiryNumber}</td>
        <td style="font-size:16px;font-weight:600;text-align:right;padding-bottom:12px;">${formattedTotal}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr><td style="font-size:12px;color:#666;padding-bottom:4px;">Customer</td></tr>
      <tr><td style="font-size:15px;font-weight:600;">${customerName}</td></tr>
      <tr><td style="font-size:13px;color:#444;padding-top:6px;">${companyName}</td></tr>
      <tr><td style="font-size:13px;color:#444;padding-top:8px;"><a href="mailto:${customerEmail}" style="color:#1a1a1a;text-decoration:underline;">${customerEmail}</a></td></tr>
      ${customerPhone ? `<tr><td style="font-size:13px;color:#444;padding-top:4px;"><a href="tel:${customerPhone}" style="color:#1a1a1a;text-decoration:underline;">${customerPhone}</a></td></tr>` : ""}
    </table>

    <a href="${APP_URL}/admin/inquiries/${inquiryId}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      Open Inquiry →
    </a>
  `;

  for (const toEmail of toEmails) {
    await sendAndLog({
      to: toEmail,
      subject: `🤝 Meeting Request — ${inquiryNumber}`,
      html: baseLayout(`Meeting Request — ${inquiryNumber}`, body),
      template: "meeting_request",
    });
  }
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

/** Sent to admin(s) when a contact-form inquiry is submitted. */
export async function sendContactInquiryToAdminEmail(params: {
  toEmails: string[];
  inquiryNumber: string;
  inquiryId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string | null;
  message: string | null;
  transactionalConsent: boolean;
  marketingConsent: boolean;
  leadScore: "HIGH" | "MEDIUM" | "LOW";
}) {
  const {
    toEmails,
    inquiryNumber,
    inquiryId,
    customerName,
    customerEmail,
    customerPhone,
    companyName,
    message,
    transactionalConsent,
    marketingConsent,
    leadScore,
  } = params;

  const scoreBadgeColor =
    leadScore === "HIGH" ? "#dc2626" : leadScore === "MEDIUM" ? "#d97706" : "#6b7280";

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">New Inquiry Received</h2>
    <p style="margin:0 0 24px;color:#666;">A new inquiry was submitted from the website contact form. Reply within 10 minutes for best conversion.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:4px;">Reference</td>
        <td style="font-size:12px;color:#666;padding-bottom:4px;text-align:right;">Lead Score</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:600;font-family:monospace;padding-bottom:12px;">${inquiryNumber}</td>
        <td style="text-align:right;padding-bottom:12px;">
          <span style="display:inline-block;background:${scoreBadgeColor};color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:10px;letter-spacing:0.5px;">${leadScore}</span>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e5e5e5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr><td style="font-size:11px;color:#999;letter-spacing:0.5px;text-transform:uppercase;padding-bottom:6px;">Contact</td></tr>
      <tr><td style="font-size:16px;font-weight:600;color:#1a1a1a;">${customerName}</td></tr>
      ${companyName ? `<tr><td style="font-size:13px;color:#666;padding-top:2px;">${companyName}</td></tr>` : ""}
      <tr><td style="font-size:13px;color:#444;padding-top:10px;"><a href="mailto:${customerEmail}" style="color:#1a1a1a;text-decoration:underline;">${customerEmail}</a></td></tr>
      <tr><td style="font-size:13px;color:#444;padding-top:4px;"><a href="tel:${customerPhone}" style="color:#1a1a1a;text-decoration:underline;">${customerPhone}</a></td></tr>
    </table>

    ${
      message
        ? `<div style="background:#fff;border-left:3px solid #1a1a1a;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
            <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>`
        : `<p style="font-size:13px;color:#999;font-style:italic;margin-bottom:24px;">No message provided.</p>`
    }

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:11px;color:#666;line-height:1.6;">
          <strong>Transactional SMS consent:</strong> ${transactionalConsent ? "✓ Granted" : "✗ Not granted"}<br/>
          <strong>Marketing SMS consent:</strong> ${marketingConsent ? "✓ Granted" : "✗ Not granted"}
        </td>
      </tr>
    </table>

    <a href="${APP_URL}/admin/inquiries/${inquiryId}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      Open in CRM →
    </a>
  `;

  for (const toEmail of toEmails) {
    await sendAndLog({
      to: toEmail,
      subject: `New Inquiry — ${customerName}${companyName ? ` (${companyName})` : ""} · ${inquiryNumber}`,
      html: baseLayout(`New Inquiry — ${inquiryNumber}`, body),
      template: "contact_inquiry_admin",
    });
  }
}

/** Sent to the customer to confirm their contact-form inquiry was received. */
export async function sendContactInquiryConfirmationEmail(params: {
  toEmail: string;
  customerName: string;
  inquiryNumber: string;
}) {
  const { toEmail, customerName, inquiryNumber } = params;

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">We got your inquiry</h2>
    <p style="margin:0 0 24px;color:#666;">Hi ${customerName}, thanks for reaching out. Our team will get back to you within 10 minutes during business hours (Mon–Sat, 9 AM – 7 PM IST).</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#666;padding-bottom:6px;">Reference Number</td>
      </tr>
      <tr>
        <td style="font-size:18px;font-weight:600;font-family:monospace;">${inquiryNumber}</td>
      </tr>
    </table>

    <p style="color:#444;line-height:1.6;">Keep this reference handy if you need to follow up. You can also browse our equipment catalog while you wait.</p>

    <a href="${APP_URL}/catalog" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;">
      Browse Catalog →
    </a>
  `;

  await sendAndLog({
    to: toEmail,
    subject: `We got your inquiry — ${inquiryNumber}`,
    html: baseLayout(`Inquiry Received — ${inquiryNumber}`, body),
    template: "contact_inquiry_confirmation",
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
