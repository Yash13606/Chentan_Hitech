"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { clearDbCartAction } from "@/server/actions/cart";
import { computeLeadScore } from "@/server/services/lead-scoring";
import {
  sendQuotationReadyEmail,
  sendQuotationToAdminEmail,
} from "@/server/services/email";
import { checkRfqRateLimit } from "@/server/services/rate-limit";
import { writeAuditLog } from "@/server/services/audit";
import { renderAndUploadQuotationPdf } from "@/server/services/pdf";
import type { LineItem } from "@/server/services/pdf/QuotationPdf";
import { after } from "next/server";
import { revalidateTag } from "next/cache";
import type { IndustryType } from "@/generated/prisma/client";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type RfqFormState = {
  error?: string;
  inquiryNumber?: string;
};

// Default terms applied to every auto-generated indicative quotation.
const DEFAULT_TAX_PERCENT = 18; // GST
const DEFAULT_DELIVERY_TERMS = "Delivered to site";
const DEFAULT_PAYMENT_TERMS = "50% advance, 50% on delivery";
const DEFAULT_VALID_DAYS = 30;

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

async function generateInquiryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.inquiry.count();
  const seq = String(count + 1).padStart(4, "0");
  return `CHT-${year}-${seq}`;
}

/**
 * Get all admin notification recipients.
 * Priority: ADMIN_NOTIFICATION_EMAIL env (comma-separated) → all DB users with ADMIN role.
 */
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

// ─────────────────────────────────────────────────────
// SUBMIT RFQ → AUTO-GENERATE QUOTATION
// One atomic action: creates inquiry → creates quotation → renders PDF
// → uploads to R2 → emails client + admin.
// No admin approval required. Uses catalog prices.
// ─────────────────────────────────────────────────────

export async function submitRfqAction(
  _prev: RfqFormState,
  formData: FormData
): Promise<RfqFormState> {
  const session = await requireAuth();

  // Rate limit: 5 RFQs per hour per user
  const allowed = await checkRfqRateLimit(session.user.id);
  if (!allowed) {
    return {
      error: "Too many quotation requests. Please wait before submitting again.",
    };
  }

  // Load DB cart with product details
  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              priceCents: true,
              availability: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "Your cart is empty. Add products before requesting a quotation." };
  }

  // Catch products with no price — auto-quote can't price them
  const unpriced = cart.items.filter((i) => !i.product.priceCents);
  if (unpriced.length > 0) {
    return {
      error: `Some products don't have list prices yet: ${unpriced
        .map((i) => i.product.sku)
        .join(", ")}. Please contact us directly for a custom quote.`,
    };
  }

  // Load customer's company for lead scoring
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
          orgSize: true,
          city: true,
          state: true,
        },
      },
    },
  });

  if (!user?.companyId || !user.company) {
    return {
      error: "Company profile is required. Please complete your profile.",
    };
  }

  // Project detail fields — all optional now
  const priority = (formData.get("priority") as string) || "STANDARD";
  const projectNotes = (formData.get("projectNotes") as string) || null;
  const deliveryLocation = (formData.get("deliveryLocation") as string) || null;
  const deliveryTimeline = (formData.get("deliveryTimeline") as string) || null;

  // Lead score for analytics (admin still sees this)
  const totalItems = cart.items.reduce((sum, i) => sum + i.qty, 0);
  const leadScore = computeLeadScore({
    industry: user.company.industry as IndustryType,
    orgSize: user.company.orgSize,
    projectNotes,
    totalItems,
    priority,
  });

  // Cart snapshot (immutable record of what was selected)
  const cartSnapshot = cart.items.map((item) => ({
    productId: item.product.id,
    title: item.product.title,
    sku: item.product.sku,
    qty: item.qty,
    priceCents: item.product.priceCents,
    notes: item.notes,
    availability: item.product.availability,
  }));

  // Line items for the quotation (same as cart snapshot, but typed for PDF)
  const lineItems: LineItem[] = cart.items.map((item) => ({
    productId: item.product.id,
    title: item.product.title,
    sku: item.product.sku,
    qty: item.qty,
    unitCents: item.product.priceCents ?? 0,
    notes: item.notes,
  }));

  // Pricing
  const subtotalCents = lineItems.reduce((s, i) => s + i.qty * i.unitCents, 0);
  const taxCents = Math.round(subtotalCents * (DEFAULT_TAX_PERCENT / 100));
  const totalCents = subtotalCents + taxCents;

  const inquiryNumber = await generateInquiryNumber();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + DEFAULT_VALID_DAYS);

  // ── ATOMIC TRANSACTION: inquiry + quotation in one shot ──
  const { inquiryId, quotationId } = await db.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.create({
      data: {
        inquiryNumber,
        companyId: user.companyId!,
        customerId: session.user.id,
        priority,
        projectNotes,
        deliveryLocation,
        deliveryTimeline,
        cartSnapshot,
        leadScore,
        status: "QUOTED", // jumps straight to QUOTED — no manual review needed
      },
    });

    // Increment version if this customer already has quotations for prior RFQs
    // (per RFQ this is always v1, but we keep the version field for future revisions)
    const quotation = await tx.quotation.create({
      data: {
        inquiryId: inquiry.id,
        version: 1,
        status: "SENT", // skip DRAFT/PENDING_APPROVAL/APPROVED
        lineItems: lineItems as object[],
        subtotalCents,
        taxCents,
        totalCents,
        deliveryTerms: DEFAULT_DELIVERY_TERMS,
        paymentTerms: DEFAULT_PAYMENT_TERMS,
        validUntil,
        notes: projectNotes,
        createdById: session.user.id,
        sentAt: new Date(),
      },
    });

    return { inquiryId: inquiry.id, quotationId: quotation.id };
  });

  // ── PDF rendering (outside transaction — can be slow) ──
  let pdfKey: string | null = null;
  try {
    const quotationNumber = `Q-${inquiryNumber}-v1`;
    pdfKey = await renderAndUploadQuotationPdf(quotationId, 1, {
      quotationNumber,
      version: 1,
      issueDate: new Date().toISOString(),
      validUntil: validUntil.toISOString(),
      customerName: user.name ?? "Customer",
      customerEmail: user.email,
      companyName: user.company.name,
      companyCity: user.company.city,
      companyState: user.company.state,
      lineItems,
      subtotalCents,
      taxCents,
      totalCents,
      deliveryTerms: DEFAULT_DELIVERY_TERMS,
      paymentTerms: DEFAULT_PAYMENT_TERMS,
      notes: projectNotes,
    });

    await db.quotation.update({
      where: { id: quotationId },
      data: { pdfKey },
    });
  } catch (err) {
    console.error("[rfq] PDF generation failed:", err);
    // Don't fail the whole flow — the quotation still exists, admin can regenerate
  }

  await writeAuditLog(session.user.id, "CREATE", "Inquiry", inquiryNumber);

  // Clear cart now that everything's saved
  await clearDbCartAction();

  // ── Fire emails async (don't block redirect) ──
  after(async () => {
    // Customer email
    if (user.email) {
      await sendQuotationReadyEmail({
        toEmail: user.email,
        customerName: user.name ?? "Customer",
        inquiryNumber,
        totalCents,
        quotationId,
      });
    }

    // Admin notification — every admin gets a copy
    const adminEmails = await getAdminNotificationEmails();
    if (adminEmails.length > 0) {
      await sendQuotationToAdminEmail({
        toEmails: adminEmails,
        inquiryNumber,
        customerName: user.name ?? "Customer",
        customerEmail: user.email,
        companyName: user.company!.name,
        totalCents,
        itemCount: lineItems.length,
        quotationId,
        inquiryId,
      });
    }
  });

  revalidateTag("quotations", "default");
  revalidateTag("inquiries", "default");

  return { inquiryNumber };
}
