import { handlers, auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  if (url.pathname === "/api/auth/session") {
    return NextResponse.json(await auth());
  }
  return handlers.GET(req);
};

export const POST = handlers.POST;
