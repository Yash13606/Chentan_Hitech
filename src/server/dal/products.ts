import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/server/db";

// ─────────────────────────────────────────────────────
// PRODUCTS DATA ACCESS LAYER
// Caching model: unstable_cache (cacheComponents OFF)
// Tags: "products", "categories"
// Revalidated by: admin product write actions
// ─────────────────────────────────────────────────────

/** All active categories in tree order */
export const getCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
  },
  ["categories"],
  { tags: ["categories"], revalidate: 3600 }
);

/** All industries */
export const getIndustries = unstable_cache(
  async () => {
    return db.industry.findMany({ orderBy: { sortOrder: "asc" } });
  },
  ["industries"],
  { tags: ["industries"], revalidate: 3600 }
);

/** Catalog list with optional filters */
export type CatalogFilters = {
  categoryId?: string;
  industryType?: string;
  availability?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function getCatalogProducts(
  filters: CatalogFilters = {},
  isLoggedIn = false
) {
  const { categoryId, industryType, availability, search, page = 1, perPage = 24 } =
    filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(availability ? { availability: availability as "IN_STOCK" | "MADE_TO_ORDER" | "DISCONTINUED" } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(industryType
      ? {
          industries: {
            some: {
              industry: { type: industryType as "HOSPITALITY" | "RESTAURANT" | "HEALTHCARE" | "DEFENCE" | "MARINE" | "LAUNDRY" | "EDUCATION" | "CORPORATE" | "OTHER" },
            },
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        slug: true,
        title: true,
        description: true,
        availability: true,
        images: true,
        specs: true,
        // Price only for logged-in users (PRD: pricing is a privilege)
        ...(isLoggedIn ? { priceCents: true } : {}),
        category: { select: { name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, perPage, pages: Math.ceil(total / perPage) };
}

/** Single product detail */
export async function getProductBySlug(slug: string, isLoggedIn = false) {
  return db.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      sku: true,
      slug: true,
      title: true,
      description: true,
      availability: true,
      images: true,
      specs: true,
      ...(isLoggedIn ? { priceCents: true } : {}),
      category: { select: { name: true, slug: true } },
      industries: {
        select: { industry: { select: { name: true, slug: true } } },
      },
    },
  });
}

/** Featured products for homepage — cached aggressively */
export const getFeaturedProducts = unstable_cache(
  async () => {
    return db.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        slug: true,
        title: true,
        description: true,
        availability: true,
        images: true,
        specs: true,
        category: { select: { name: true } },
      },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });
  },
  ["featured-products"],
  { tags: ["products"], revalidate: 3600 }
);
