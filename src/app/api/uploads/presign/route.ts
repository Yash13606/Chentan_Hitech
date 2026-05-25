import { auth } from "@/server/auth";
import { presignPut } from "@/server/services/r2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  key: z.string().min(1).max(500),
  contentType: z.string().min(1),
  maxBytes: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { key, contentType, maxBytes } = parsed.data;

  // Prefix key with userId to scope uploads
  const scopedKey = `uploads/${session.user.id}/${key}`;

  const url = await presignPut(scopedKey, contentType, maxBytes);
  return NextResponse.json({ url, key: scopedKey });
}
