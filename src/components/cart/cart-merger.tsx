"use client";

import { useEffect, useRef } from "react";
import { useGuestCart } from "@/lib/cart-store";
import { mergeGuestCartAction } from "@/server/actions/cart";

/**
 * Placed in the (account) layout.
 * On first mount after login, merges any localStorage guest cart into the DB cart,
 * then clears the local store. Silent — no UI.
 */
export function CartMerger() {
  const items = useGuestCart((s) => s.items);
  const clearCart = useGuestCart((s) => s.clearCart);
  const didMerge = useRef(false);

  useEffect(() => {
    if (didMerge.current || items.length === 0) return;
    didMerge.current = true;

    mergeGuestCartAction(items)
      .then(() => clearCart())
      .catch(() => {
        // Non-fatal — guest cart remains in localStorage
        didMerge.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount only

  return null;
}
