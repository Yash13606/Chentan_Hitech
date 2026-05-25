import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/server/db";

/** Published articles for public listing */
export const getPublishedArticles = unstable_cache(
  async (take = 10) => {
    return db.knowledgeArticle.findMany({
      where: { publishedAt: { not: null, lte: new Date() } },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        industry: true,
        tags: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take,
    });
  },
  ["published-articles"],
  { tags: ["articles"], revalidate: 3600 }
);

/** Single article by slug */
export async function getArticleBySlug(slug: string) {
  return db.knowledgeArticle.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      industry: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

/** Single article by ID — full fields for admin editing */
export async function getArticleByIdAdmin(id: string) {
  return db.knowledgeArticle.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      industry: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

/** All articles for admin (including drafts) */
export async function getAllArticlesAdmin() {
  return db.knowledgeArticle.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      industry: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
