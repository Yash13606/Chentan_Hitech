"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { clearDbCartAction } from "@/server/actions/cart";
import { computeLeadScore } from "@/server/services/lead-scoring";
import { sendRfqConfirmationEmail } from "@/server/services/email";
import { checkRfqRateLimit } from "@/server/services/rate-limit";
import { writeAuditLog } from "@/server/services/audit";
import { after } from "next/server";
import type { IndustryType } from "@/generated/prisma/client";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type RfqFormState = {
  error?: string;
  inquiryNumber?: string;
};

// ─────────────────────────────────────────────────────
// GENERATE INQUIRY NUMBER
// e.g. CHT-2024-0001
// ─────────────────────────────────────────────────────

async function generateInquiryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.inquiry.count();
  const seq = String(count + 1).padStart(4, "0");
  return `CHT-${year}-${seq}`;
}

// ─────────────────────────────────────────────────────
// SUBMIT RFQ
// ─────────────────────────────────────────────────────

export async function submitRfqAction(
  _prev: RfqFormState,
  formData: FormData
): Promise<RfqFormState> {
  const session = await requireAuth();

  // Rate limit: 5 RFQs per hour per user
  const allowed = await checkRfqRateLimit(session.user.id);
  if (!allowed) {
    return { error: "Too many RFQ submissions. Please wait before submitting again." };
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
    return { error: "Your cart is empty. Add products before submitting an RFQ." };
  }

  // Load customer's company for lead scoring
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      companyId: true,
      company: {
        select: {
          id: true,
          industry: true,
          orgSize: true,
        },
      },
    },
  });

  if (!user?.companyId || !user.company) {
    return { error: "Company profile is required to submit an RFQ. Please complete your profile." };
  }

  const priority = (formData.get("priority") as string) || "STANDARD";
  const projectNotes = (formData.get("projectNotes") as string) || null;
  const deliveryLocation = (formData.get("deliveryLocation") as string) || null;
  const deliveryTimeline = (formData.get("deliveryTimeline") as string) || null;

  // Compute lead score
  const totalItems = cart.items.reduce((sum, i) => sum + i.qty, 0);
  const leadScore = computeLeadScore({
    industry: user.company.industry as IndustryType,
    orgSize: user.company.orgSize,
    projectNotes,
    totalItems,
    priority,
  });

  // Build cart snapshot (immutable copy of items at submission time)
  const cartSnapshot = cart.items.map((item) => ({
    productId: item.product.id,
    title: item.product.title,
    sku: item.product.sku,
    qty: item.qty,
    priceCents: item.product.priceCents,
    notes: item.notes,
    availability: item.product.availability,
  }));

  const inquiryNumber = await generateInquiryNumber();

  await db.inquiry.create({
    data: {
      inquiryNumber,
      companyId: user.companyId,
      customerId: session.user.id,
      priority,
      projectNotes,
      deliveryLocation,
      deliveryTimeline,
      cartSnapshot,
      leadScore,
      status: "NEW",
    },
  });

  // Audit log
  await writeAuditLog(session.user.id, "CREATE", "Inquiry", inquiryNumber);

  // Clear the DB cart
  await clearDbCartAction();

  // Fire confirmation email non-blocking
  const customerEmail = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });

  after(async () => {
    if (customerEmail) {
      await sendRfqConfirmationEmail({
        toEmail: customerEmail.email,
        customerName: customerEmail.name ?? "Customer",
        inquiryNumber,
        itemCount: cart.items.length,
      });
    }
  });

  return { inquiryNumber };
}
