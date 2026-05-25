import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    // Verify DB is reachable with a lightweight query
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        db: "ok",
        latencyMs: Date.now() - start,
        version: process.env.npm_package_version ?? "unknown",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Health] DB check failed:", err);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        db: "unreachable",
        latencyMs: Date.now() - start,
      },
      { status: 503 }
    );
  }
}
