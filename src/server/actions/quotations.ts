"use server";

import { requireAuth, requireSalesOrAbove } from "@/server/actions/_wrap";
import { requireAdmin } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { revalidateTag } from "next/cache";
import { renderAndUploadQuotationPdf } from "@/server/services/pdf";
import { presignGet } from "@/server/services/r2";
import { sendQuotationReadyEmail } from "@/server/services/email";
import { writeAuditLog } from "@/server/services/audit";
import { after } from "next/server";
import { z } from "zod";
import type { LineItem } from "@/server/services/pdf/QuotationPdf";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type QuotationFormState = {
  error?: string;
  success?: boolean;
  quotationId?: string;
};

const lineItemSchema = z.object({
  productId: z.string(),
  title: z.string(),
  sku: z.string(),
  qty: z.number().int().min(1),
  unitCents: z.number().int().min(0),
  notes: z.string().optional().nullable(),
});

const createQuotationSchema = z.object({
  inquiryId: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
  taxCents: z.coerce.number().int().min(0).default(0),
  deliveryTerms: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ─────────────────────────────────────────────────────
// CREATE QUOTATION (Sales / Quote Manager)
// ─────────────────────────────────────────────────────

export async function createQuotationAction(
  _prev: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const session = await requireSalesOrAbove();

  // Parse line items from JSON in the form field
  const lineItemsRaw = formData.get("lineItems") as string;
  let parsedLineItems: LineItem[];
  try {
    parsedLineItems = JSON.parse(lineItemsRaw);
  } catch {
    return { error: "Invalid line items data." };
  }

  const raw = {
    inquiryId: formData.get("inquiryId") as string,
    lineItems: parsedLineItems,
    taxCents: formData.get("taxCents"),
    deliveryTerms: formData.get("deliveryTerms"),
    paymentTerms: formData.get("paymentTerms"),
    validUntil: formData.get("validUntil"),
    notes: formData.get("notes"),
  };

  const parsed = createQuotationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const { inquiryId, lineItems, taxCents, deliveryTerms, paymentTerms, validUntil, notes } =
    parsed.data;

  // Check inquiry exists
  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return { error: "Inquiry not found." };

  // Calculate totals
  const subtotalCents = lineItems.reduce((s, i) => s + i.qty * i.unitCents, 0);
  const totalCents = subtotalCents + taxCents;

  // Increment version if revising
  const lastVersion = await db.quotation.findFirst({
    where: { inquiryId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (lastVersion?.version ?? 0) + 1;

  const quotation = await db.quotation.create({
    data: {
      inquiryId,
      version,
      status: "DRAFT",
      lineItems: lineItems as object[],
      subtotalCents,
      taxCents,
      totalCents,
      deliveryTerms: deliveryTerms ?? null,
      paymentTerms: paymentTerms ?? null,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes: notes ?? null,
      createdById: session.user.id,
    },
  });

  return { success: true, quotationId: quotation.id };
}

// ─────────────────────────────────────────────────────
// GENERATE PDF (Sales / Quote Manager)
// Creates PDF, uploads to R2, sets status → PENDING_APPROVAL
// ─────────────────────────────────────────────────────

export async function generateQuotationPdfAction(
  quotationId: string
): Promise<{ ok: true; pdfKey: string } | { ok: false; error: string }> {
  await requireSalesOrAbove();

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    include: {
      inquiry: {
        include: {
          customer: { select: { name: true, email: true } },
          company: { select: { name: true, city: true, state: true } },
        },
      },
    },
  });

  if (!quotation) return { ok: false, error: "Quotation not found." };
  if (quotation.status === "APPROVED") {
    return { ok: false, error: "Approved quotations cannot be regenerated." };
  }

  const lineItems = quotation.lineItems as LineItem[];
  const quotationNumber = `Q-${quotation.inquiryId.slice(0, 6).toUpperCase()}-v${quotation.version}`;

  const pdfKey = await renderAndUploadQuotationPdf(quotationId, quotation.version, {
    quotationNumber,
    version: quotation.version,
    issueDate: quotation.createdAt.toISOString(),
    validUntil: quotation.validUntil?.toISOString() ?? null,
    customerName: quotation.inquiry.customer.name ?? "Customer",
    customerEmail: quotation.inquiry.customer.email ?? "",
    companyName: quotation.inquiry.company.name,
    companyCity: quotation.inquiry.company.city,
    companyState: quotation.inquiry.company.state,
    lineItems,
    subtotalCents: quotation.subtotalCents,
    taxCents: quotation.taxCents,
    totalCents: quotation.totalCents,
    deliveryTerms: quotation.deliveryTerms,
    paymentTerms: quotation.paymentTerms,
    notes: quotation.notes,
  });

  await db.quotation.update({
    where: { id: quotationId },
    data: { pdfKey, status: "PENDING_APPROVAL" },
  });

  // Update inquiry status to IN_REVIEW
  await db.inquiry.update({
    where: { id: quotation.inquiryId },
    data: { status: "IN_REVIEW" },
  });

  revalidateTag("quotations", "default");
  return { ok: true, pdfKey };
}

// ─────────────────────────────────────────────────────
// APPROVE QUOTATION (Admin only)
// ─────────────────────────────────────────────────────

export async function approveQuotationAction(
  quotationId: string
): Promise<QuotationFormState> {
  const session = await requireAdmin();

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    select: { id: true, inquiryId: true, status: true, pdfKey: true },
  });

  if (!quotation) return { error: "Quotation not found." };
  if (quotation.status !== "PENDING_APPROVAL") {
    return { error: "Only quotations pending approval can be approved." };
  }
  if (!quotation.pdfKey) {
    return { error: "Generate the PDF first before approving." };
  }

  await db.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotationId },
      data: {
        status: "APPROVED",
        approvedById: session.user.id,
        approvedAt: new Date(),
        sentAt: new Date(),
      },
    });
    await tx.inquiry.update({
      where: { id: quotation.inquiryId },
      data: { status: "QUOTED" },
    });
  });

  // Fire customer notification email non-blocking
  after(async () => {
    const freshQuotation = await db.quotation.findUnique({
      where: { id: quotationId },
      select: {
        totalCents: true,
        inquiry: {
          select: {
            inquiryNumber: true,
            customer: { select: { email: true, name: true } },
          },
        },
      },
    });
    if (freshQuotation) {
      await sendQuotationReadyEmail({
        toEmail: freshQuotation.inquiry.customer.email ?? "",
        customerName: freshQuotation.inquiry.customer.name ?? "Customer",
        inquiryNumber: freshQuotation.inquiry.inquiryNumber,
        totalCents: freshQuotation.totalCents,
        quotationId,
      });
    }
  });

  revalidateTag("quotations", "default");
  return { success: true };
}

// ─────────────────────────────────────────────────────
// GET PRESIGNED DOWNLOAD URL (Customer + Sales + Admin)
// ─────────────────────────────────────────────────────

export async function getQuotationDownloadUrlAction(
  quotationId: string
): Promise<{ url: string } | { error: string }> {
  const session = await requireAuth();

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    select: {
      pdfKey: true,
      status: true,
      inquiry: { select: { customerId: true } },
    },
  });

  if (!quotation || !quotation.pdfKey) {
    return { error: "PDF not available." };
  }

  // Customers can only download their own approved quotations
  if (
    session.user.role === "CUSTOMER" &&
    quotation.inquiry.customerId !== session.user.id
  ) {
    return { error: "Access denied." };
  }

  if (quotation.status !== "APPROVED" && session.user.role === "CUSTOMER") {
    return { error: "This quotation is not yet approved." };
  }

  // Mint a 24-hour presigned URL
  const url = await presignGet(quotation.pdfKey, 86400);
  return { url };
}

// ─────────────────────────────────────────────────────
// GET QUOTATION PREVIEW URL (Sales / Admin)
// 15-minute expiry for in-app preview
// ─────────────────────────────────────────────────────

export async function getQuotationPreviewUrlAction(
  quotationId: string
): Promise<{ url: string } | { error: string }> {
  await requireSalesOrAbove();

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    select: { pdfKey: true },
  });

  if (!quotation?.pdfKey) return { error: "PDF not generated yet." };

  const url = await presignGet(quotation.pdfKey, 900); // 15 min
  return { url };
}
