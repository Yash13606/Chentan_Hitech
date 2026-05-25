"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { z } from "zod";

const profileSchema = z.object({
  companyName: z.string().min(1, "Company name required"),
  industry: z.string().optional(),
  orgSize: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await requireAuth();

  const raw = {
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    orgSize: formData.get("orgSize") || null,
    city: formData.get("city") || null,
    state: formData.get("state") || null,
    phone: formData.get("phone") || null,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });
  if (!user?.companyId) return { error: "Company profile not found." };

  await db.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: user.companyId! },
      data: {
        name: parsed.data.companyName,
        industry: (parsed.data.industry as Parameters<typeof tx.company.update>[0]["data"]["industry"]) ?? undefined,
        orgSize: parsed.data.orgSize,
        city: parsed.data.city,
        state: parsed.data.state,
      },
    });
    if (parsed.data.phone !== undefined) {
      await tx.user.update({
        where: { id: session.user.id },
        data: { phone: parsed.data.phone },
      });
    }
  });

  return { success: true };
}
