"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";

export type BundleState = { error?: string; success?: boolean; id?: string };

export async function createBundleAction(
  _prev: BundleState,
  formData: FormData
): Promise<BundleState> {
  const session = await requireAuth();

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "Bundle name is required" };

  const bundle = await db.bundle.create({
    data: {
      name,
      description,
      createdById: session.user.id,
      isPublic: false,
    },
  });

  return { success: true, id: bundle.id };
}

export async function addBundleItemAction(
  bundleId: string,
  productId: string,
  qty: number,
  notes?: string
): Promise<BundleState> {
  const session = await requireAuth();

  // Ownership check
  const bundle = await db.bundle.findUnique({ where: { id: bundleId } });
  if (!bundle || bundle.createdById !== session.user.id) return { error: "Bundle not found" };

  await db.bundleItem.upsert({
    where: {
      // No unique constraint on (bundleId, productId) in schema — use findFirst then create/update
      id: (
        await db.bundleItem.findFirst({ where: { bundleId, productId }, select: { id: true } })
      )?.id ?? "__new__",
    },
    create: { bundleId, productId, qty, notes },
    update: { qty, notes },
  });

  return { success: true };
}

export async function removeBundleItemAction(
  itemId: string
): Promise<BundleState> {
  const session = await requireAuth();

  const item = await db.bundleItem.findUnique({
    where: { id: itemId },
    include: { bundle: { select: { createdById: true } } },
  });

  if (!item || item.bundle.createdById !== session.user.id) {
    return { error: "Item not found" };
  }

  await db.bundleItem.delete({ where: { id: itemId } });
  return { success: true };
}

export async function deleteBundleAction(bundleId: string): Promise<BundleState> {
  const session = await requireAuth();

  const bundle = await db.bundle.findUnique({ where: { id: bundleId } });
  if (!bundle || bundle.createdById !== session.user.id) return { error: "Bundle not found" };

  await db.bundle.delete({ where: { id: bundleId } });
  return { success: true };
}

export async function addBundleToCartAction(bundleId: string): Promise<BundleState> {
  const session = await requireAuth();

  const bundle = await db.bundle.findUnique({
    where: { id: bundleId },
    include: { items: { include: { product: { select: { id: true, isActive: true } } } } },
  });

  if (!bundle) return { error: "Bundle not found" };
  // Allow own bundles or public ones
  if (!bundle.isPublic && bundle.createdById !== session.user.id) {
    return { error: "Not authorised" };
  }

  // Get or create user cart
  let cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: session.user.id } });
  }

  // Upsert each active bundle item into cart
  for (const item of bundle.items) {
    if (!item.product.isActive) continue;
    const existing = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId: item.productId },
    });
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + item.qty },
      });
    } else {
      await db.cartItem.create({
        data: { cartId: cart.id, productId: item.productId, qty: item.qty, notes: item.notes },
      });
    }
  }

  return { success: true };
}
