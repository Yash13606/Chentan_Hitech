import { auth } from "@/server/auth";
import { getArticleByIdAdmin } from "@/server/dal/articles";
import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles: string[] = [Role.ADMIN, Role.SALES, Role.QUOTE_MGR];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const article = await getArticleByIdAdmin(id);

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}
