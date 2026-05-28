"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { after } from "next/server";
import { revalidateTag } from "next/cache";

import { db } from "@/server/db";
import { checkContactRateLimit } from "@/server/services/rate-limit";
import { writeAuditLog } from "@/server/services/audit";
import {
  sendContactInquiryConfirmationEmail,
  sendContactInquiryToAdminEmail,
} from "@/server/services/email";
import type { LeadScore } from "@/generated/prisma/client";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type InquiryFormState = {
  inquiryNumber?: string;
  error?: string;
  fieldErrors?: Partial<Record<
    "name" | "email" | "phone" | "company" | "message" | "transactionalConsent",
    string
  >>;
};

// ─────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────

const MESSAGE_MAX = 1000;

/**
 * Forgiving phone normaliser — accepts any format the user typed and reduces
 * it to a canonical "+digits" form for storage. Validation only requires
 * 7–15 digits (E.164 range) once stripped.
 */
function normalisePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  // Move a single leading "+" to the front; drop any other "+"
  const hasPlus = digits.startsWith("+");
  const onlyDigits = digits.replace(/\+/g, "");
  if (onlyDigits.length < 7 || onlyDigits.length > 15) return null;
  return (hasPlus ? "+" : "") + onlyDigits;
}

const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(120, "Email is too long"),
  phone: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .transform((v, ctx) => {
      const normalised = normalisePhone(v);
      if (!normalised) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid mobile number",
        });
        return z.NEVER;
      }
      return normalised;
    }),
  company: z
    .string()
    .trim()
    .max(120, "Company name is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  message: z
    .string()
    .trim()
    .max(MESSAGE_MAX, `Message must be under ${MESSAGE_MAX} characters`)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  transactionalConsent: z
    .literal("on", { error: "Required to receive updates about your inquiry" })
    .transform(() => true),
  marketingConsent: z
    .union([z.literal("on"), z.literal("")])
    .optional()
    .transform((v) => v === "on"),
});

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

async function generateInquiryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.inquiry.count();
  const seq = String(count + 1).padStart(4, "0");
  return `CHT-${year}-${seq}`;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}

async function getAdminNotificationEmails(): Promise<string[]> {
  const envList = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (envList) {
    return envList
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  }
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admins.map((a) => a.email).filter(Boolean);
}

const HIGH_INTENT_KEYWORDS = [
  "urgent",
  "immediate",
  "tender",
  "defence",
  "navy",
  "army",
  "hospital",
  "hotel",
  "kitchen",
  "laundry",
];

function scoreContactInquiry(message: string | null, company: string | null): LeadScore {
  const text = `${message ?? ""} ${company ?? ""}`.toLowerCase();
  if (HIGH_INTENT_KEYWORDS.some((kw) => text.includes(kw))) return "HIGH";
  if (company && (message?.length ?? 0) > 80) return "MEDIUM";
  return "LOW";
}

// ─────────────────────────────────────────────────────
// ACTION
// ─────────────────────────────────────────────────────

export async function submitInquiryAction(
  _prev: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  // 1. Rate limit by IP
  const ip = await getClientIp();
  const allowed = await checkContactRateLimit(ip);
  if (!allowed) {
    return {
      error: "Too many inquiries from this network. Please wait a few minutes before trying again.",
    };
  }

  // 2. Validate
  const raw = {
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    message: formData.get("message") ?? "",
    transactionalConsent: formData.get("transactionalConsent") ?? "",
    marketingConsent: formData.get("marketingConsent") ?? "",
  };

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: InquiryFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<InquiryFormState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      error: "Please correct the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // 3. Find or create the User (passwordless lead). If they already exist and
  //    have a real Company link from prior signup, we attach the new inquiry to
  //    that — never re-link to a fresh "lead" company.
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
    select: { id: true, companyId: true },
  });

  let companyId: string;
  if (existingUser?.companyId) {
    companyId = existingUser.companyId;
  } else {
    const newCompany = await db.company.create({
      data: {
        name: data.company ?? `Individual — ${data.name}`,
        industry: "OTHER",
      },
      select: { id: true },
    });
    companyId = newCompany.id;
  }

  const user = await db.user.upsert({
    where: { email: data.email },
    create: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: "CUSTOMER",
      companyId,
    },
    update: {
      name: data.name,
      phone: data.phone,
    },
    select: { id: true, companyId: true },
  });

  // 5. Create the Inquiry
  const inquiryNumber = await generateInquiryNumber();
  const leadScore = scoreContactInquiry(data.message, data.company);

  const inquiry = await db.inquiry.create({
    data: {
      inquiryNumber,
      companyId: user.companyId ?? companyId,
      customerId: user.id,
      status: "NEW",
      priority: "STANDARD",
      leadScore,
      cartSnapshot: [],
      projectNotes: data.message,
    },
  });

  await writeAuditLog(user.id, "CREATE", "Inquiry", inquiry.id);

  revalidateTag("inquiries", "default");

  // 6. Fire emails async — don't block the redirect / response
  const adminEmails = await getAdminNotificationEmails();
  after(async () => {
    if (adminEmails.length > 0) {
      await sendContactInquiryToAdminEmail({
        toEmails: adminEmails,
        inquiryNumber,
        inquiryId: inquiry.id,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        companyName: data.company,
        message: data.message,
        transactionalConsent: data.transactionalConsent,
        marketingConsent: data.marketingConsent,
        leadScore,
      });
    }

    await sendContactInquiryConfirmationEmail({
      toEmail: data.email,
      customerName: data.name,
      inquiryNumber,
    });
  });

  return { inquiryNumber };
}
