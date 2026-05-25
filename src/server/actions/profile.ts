"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  orgSize: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
});

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await requireAuth();

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    orgSize: formData.get("orgSize") || null,
    gstin: formData.get("gstin") || null,
    website: formData.get("website") || null,
    address: formData.get("address") || null,
    city: formData.get("city") || null,
    state: formData.get("state") || null,
    pincode: formData.get("pincode") || null,
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
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    });
    await tx.company.update({
      where: { id: user.companyId! },
      data: {
        name: parsed.data.companyName,
        industry: (parsed.data.industry as Parameters<typeof tx.company.update>[0]["data"]["industry"]) ?? undefined,
        orgSize: parsed.data.orgSize,
        gstin: parsed.data.gstin,
        website: parsed.data.website,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
      },
    });
  });

  return { success: true };
}
