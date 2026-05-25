"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { revalidateTag } from "next/cache";
import { Role } from "@/generated/prisma/client";
import { writeAuditLog } from "@/server/services/audit";

export type ArticleState = { error?: string; success?: boolean; id?: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createArticleAction(
  _prev: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await requireAuth();
  const allowedRoles: string[] = [Role.ADMIN, Role.SALES, Role.QUOTE_MGR];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Insufficient permissions" };
  }

  const title = (formData.get("title") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const body = (formData.get("body") as string)?.trim() || "";
  const industry = (formData.get("industry") as string) || null;
  const tags = (formData.get("tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];
  const publishNow = formData.get("publishNow") === "true";

  if (!title) return { error: "Title is required" };

  const slug = slugify(title);

  // Check slug uniqueness
  const existing = await db.knowledgeArticle.findUnique({ where: { slug } });
  if (existing) {
    return { error: `Slug "${slug}" already exists. Change the title.` };
  }

  const article = await db.knowledgeArticle.create({
    data: {
      slug,
      title,
      excerpt,
      body,
      industry: industry as "HOSPITALITY" | "HEALTHCARE" | "DEFENCE" | null || null,
      tags,
      publishedAt: publishNow ? new Date() : null,
    },
  });

  await writeAuditLog(session.user.id, "CREATE", "KnowledgeArticle", article.id);
  revalidateTag("articles", "default");

  return { success: true, id: article.id };
}

export async function updateArticleAction(
  _prev: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await requireAuth();
  const allowedRoles2: string[] = [Role.ADMIN, Role.SALES, Role.QUOTE_MGR];
  if (!allowedRoles2.includes(session.user.role)) {
    return { error: "Insufficient permissions" };
  }

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const body = (formData.get("body") as string)?.trim() || "";
  const industry = (formData.get("industry") as string) || null;
  const tags = (formData.get("tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];
  const publishNow = formData.get("publishNow") === "true";
  const unpublish = formData.get("unpublish") === "true";

  if (!id || !title) return { error: "Missing required fields" };

  const existing = await db.knowledgeArticle.findUnique({ where: { id } });
  if (!existing) return { error: "Article not found" };

  await db.knowledgeArticle.update({
    where: { id },
    data: {
      title,
      excerpt,
      body,
      industry: industry as "HOSPITALITY" | "HEALTHCARE" | "DEFENCE" | null || null,
      tags,
      publishedAt: unpublish ? null : publishNow ? new Date() : existing.publishedAt,
    },
  });

  await writeAuditLog(session.user.id, "UPDATE", "KnowledgeArticle", id);
  revalidateTag("articles", "default");

  return { success: true, id };
}

export async function deleteArticleAction(id: string): Promise<ArticleState> {
  const session = await requireAuth();
  if (session.user.role !== Role.ADMIN) return { error: "Admin only" };

  await db.knowledgeArticle.delete({ where: { id } });
  await writeAuditLog(session.user.id, "DELETE", "KnowledgeArticle", id);
  revalidateTag("articles", "default");

  return { success: true };
}
