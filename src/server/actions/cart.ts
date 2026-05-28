"use server";

import { requireAuth } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import type { GuestCartItem } from "@/lib/cart-store";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type DbCartItem = {
  id: string;
  qty: number;
  notes: string | null;
  product: {
    id: string;
    title: string;
    sku: string;
    slug: string;
    priceCents: number | null;
    availability: string;
  };
};

export type DbCart = {
  id: string;
  items: DbCartItem[];
};

// ─────────────────────────────────────────────────────
// GET OR CREATE DB CART
// ─────────────────────────────────────────────────────

async function getOrCreateCart(userId: string): Promise<DbCart> {
  const existing = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              slug: true,
              priceCents: true,
              availability: true,
            },
          },
        },
      },
    },
  });
  if (existing) return existing;

  return db.cart.create({
    data: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              slug: true,
              priceCents: true,
              availability: true,
            },
          },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────
// GET CART (for logged-in user)
// ─────────────────────────────────────────────────────

export async function getDbCartAction(): Promise<DbCart | null> {
  try {
    const session = await requireAuth();
    return getOrCreateCart(session.user.id);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────
// ADD ITEM
// ─────────────────────────────────────────────────────

export type CartActionResult = { ok: true } | { ok: false; error: string };

export async function addToDbCartAction(
  productId: string,
  qty: number = 1,
  notes?: string
): Promise<CartActionResult> {
  const session = await requireAuth();
  const cart = await getOrCreateCart(session.user.id);

  const existing = cart.items.find((i) => i.product.id === productId);

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { qty: existing.qty + qty },
    });
  } else {
    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) return { ok: false, error: "Product not found." };

    await db.cartItem.create({
      data: { cartId: cart.id, productId, qty, notes: notes ?? null },
    });
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────────────────

export async function removeFromDbCartAction(
  itemId: string
): Promise<CartActionResult> {
  const session = await requireAuth();
  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return { ok: false, error: "Cart not found." };

  await db.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });
  return { ok: true };
}

// ─────────────────────────────────────────────────────
// UPDATE ITEM QTY
// ─────────────────────────────────────────────────────

export async function updateDbCartItemQtyAction(
  itemId: string,
  qty: number
): Promise<CartActionResult> {
  const session = await requireAuth();
  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return { ok: false, error: "Cart not found." };

  if (qty <= 0) {
    await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  } else {
    await db.cartItem.updateMany({
      where: { id: itemId, cartId: cart.id },
      data: { qty },
    });
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────
// SET QTY BY PRODUCT ID
// Used by catalog cards — they don't know the CartItem.id.
// Sets the line to `qty` exactly: deletes when qty <= 0,
// creates when missing, updates otherwise.
// ─────────────────────────────────────────────────────

export async function setDbCartQtyByProductAction(
  productId: string,
  qty: number
): Promise<CartActionResult> {
  const session = await requireAuth();
  const cart = await getOrCreateCart(session.user.id);
  const existing = cart.items.find((i) => i.product.id === productId);

  if (qty <= 0) {
    if (existing) {
      await db.cartItem.deleteMany({
        where: { id: existing.id, cartId: cart.id },
      });
    }
    return { ok: true };
  }

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { qty },
    });
  } else {
    const product = await db.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) return { ok: false, error: "Product not found." };

    await db.cartItem.create({
      data: { cartId: cart.id, productId, qty },
    });
  }

  return { ok: true };
}

/**
 * Lightweight read helper used by the Nav badge and catalog cards.
 * Returns a map of productId → qty for the current user's cart, or
 * an empty object for guests / no cart.
 */
export async function getCartQtyMapAction(): Promise<Record<string, number>> {
  try {
    const session = await requireAuth();
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { select: { productId: true, qty: true } } },
    });
    if (!cart) return {};
    const map: Record<string, number> = {};
    for (const item of cart.items) map[item.productId] = item.qty;
    return map;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────
// MERGE GUEST CART → DB CART (called after login)
// ─────────────────────────────────────────────────────

export async function mergeGuestCartAction(
  guestItems: GuestCartItem[]
): Promise<CartActionResult> {
  if (!guestItems.length) return { ok: true };

  const session = await requireAuth();
  const cart = await getOrCreateCart(session.user.id);

  // Upsert each guest item into DB cart
  await db.$transaction(async (tx) => {
    for (const guestItem of guestItems) {
      const existing = cart.items.find((i) => i.product.id === guestItem.productId);

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { qty: existing.qty + guestItem.qty },
        });
      } else {
        const product = await tx.product.findUnique({
          where: { id: guestItem.productId, isActive: true },
          select: { id: true },
        });
        if (!product) continue; // skip deleted products

        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: guestItem.productId,
            qty: guestItem.qty,
            notes: guestItem.notes ?? null,
          },
        });
      }
    }
  });

  return { ok: true };
}

// ─────────────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────────────

export async function clearDbCartAction(): Promise<CartActionResult> {
  const session = await requireAuth();
  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return { ok: true };

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { ok: true };
}
