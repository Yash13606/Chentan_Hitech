"use server";

import { requireAdmin } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  availability: z.enum(["IN_STOCK", "MADE_TO_ORDER", "DISCONTINUED"]).default("IN_STOCK"),
  priceCents: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.coerce.boolean().default(true),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

// ─────────────────────────────────────────────────────
// CREATE PRODUCT
// ─────────────────────────────────────────────────────

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { sku, title, description, categoryId, availability, priceCents, isActive } =
    parsed.data;

  // Check SKU uniqueness
  const existing = await db.product.findUnique({ where: { sku } });
  if (existing) return { error: `SKU "${sku}" already exists.` };

  // Derive slug from title, ensure uniqueness
  let slug = slugify(title);
  const slugConflict = await db.product.findUnique({ where: { slug } });
  if (slugConflict) slug = `${slug}-${Date.now()}`;

  await db.product.create({
    data: {
      sku,
      slug,
      title,
      description: description ?? null,
      categoryId,
      availability,
      priceCents: priceCents ?? null,
      isActive,
    },
  });

  revalidateTag("products", "default");
  redirect("/admin/products");
}

// ─────────────────────────────────────────────────────
// UPDATE PRODUCT
// ─────────────────────────────────────────────────────

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  await db.product.update({
    where: { id: productId },
    data: parsed.data,
  });

  revalidateTag("products", "default");
  return { success: true };
}

// ─────────────────────────────────────────────────────
// DELETE PRODUCT
// ─────────────────────────────────────────────────────

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  await db.product.update({
    where: { id: productId },
    data: { isActive: false },
  });
  revalidateTag("products", "default");
}

// ─────────────────────────────────────────────────────
// CREATE CATEGORY
// ─────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().optional().nullable(),
});

export type CategoryFormState = {
  error?: string;
  success?: boolean;
};

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!name) return { error: "Name is required." };

  const slug = slugify(name);
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) return { error: `Category "${name}" already exists.` };

  await db.category.create({
    data: { name, slug, parentId: parentId || null },
  });

  revalidateTag("categories", "default");
  return { success: true };
}
