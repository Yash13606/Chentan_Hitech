"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";

export type ConsultationState = {
  error?: string;
  success?: boolean;
};

export async function requestConsultationAction(
  _prev: ConsultationState,
  formData: FormData
): Promise<ConsultationState> {
  const session = await requireAuth();

  const type = (formData.get("type") as string) || "PRODUCT_INQUIRY";
  const requestedSlot = formData.get("requestedSlot") as string | null;
  const notes = (formData.get("notes") as string) || null;

  await db.consultation.create({
    data: {
      customerId: session.user.id,
      type,
      requestedSlot: requestedSlot ? new Date(requestedSlot) : null,
      notes,
      status: "REQUESTED",
    },
  });

  return { success: true };
}
