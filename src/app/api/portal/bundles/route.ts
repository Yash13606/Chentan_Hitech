import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const bundles = await db.bundle.findMany({
    where: { createdById: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, sku: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bundles);
}
