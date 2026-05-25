"use server";

import { requireSalesOrAbove } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─────────────────────────────────────────────────────
// UPDATE INQUIRY STATUS
// ─────────────────────────────────────────────────────

const validStatuses = ["NEW", "ASSIGNED", "IN_REVIEW", "QUOTED", "CLOSED_WON", "CLOSED_LOST"] as const;
type InquiryStatus = (typeof validStatuses)[number];

export async function updateInquiryStatusAction(
  inquiryId: string,
  status: InquiryStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSalesOrAbove();

  if (!validStatuses.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  await db.inquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  revalidatePath("/crm", "page");
  return { ok: true };
}

// ─────────────────────────────────────────────────────
// ASSIGN INQUIRY
// ─────────────────────────────────────────────────────

export async function assignInquiryAction(
  inquiryId: string,
  assignToId: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSalesOrAbove();

  await db.inquiry.update({
    where: { id: inquiryId },
    data: {
      assignedToId: assignToId,
      status: assignToId ? "ASSIGNED" : "NEW",
    },
  });

  if (assignToId) {
    await db.leadAssignment.create({
      data: {
        inquiryId,
        toUserId: assignToId,
        fromUserId: session.user.id,
      },
    });
  }

  revalidatePath("/crm", "page");
  return { ok: true };
}

// ─────────────────────────────────────────────────────
// ADD CALL LOG
// ─────────────────────────────────────────────────────

const callLogSchema = z.object({
  summary: z.string().min(1, "Summary required"),
  durationSec: z.coerce.number().int().min(0).optional(),
  nextActionAt: z.string().optional().nullable(),
});

export type CallLogState = { error?: string; success?: boolean };

export async function addCallLogAction(
  _prev: CallLogState,
  formData: FormData
): Promise<CallLogState> {
  const session = await requireSalesOrAbove();

  const inquiryId = formData.get("inquiryId") as string;
  if (!inquiryId) return { error: "Inquiry ID missing." };

  const parsed = callLogSchema.safeParse({
    summary: formData.get("summary"),
    durationSec: formData.get("durationSec") || undefined,
    nextActionAt: formData.get("nextActionAt") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  await db.callLog.create({
    data: {
      inquiryId,
      salesUserId: session.user.id,
      summary: parsed.data.summary,
      durationSec: parsed.data.durationSec ?? null,
      nextActionAt: parsed.data.nextActionAt ? new Date(parsed.data.nextActionAt) : null,
    },
  });

  revalidatePath("/crm", "page");
  return { success: true };
}
