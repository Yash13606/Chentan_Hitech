"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { useGuestCart } from "@/lib/cart-store";
import { getCartQtyMapAction } from "@/server/actions/cart";

const CART_CHANGED_EVENT = "cht:cart-changed";

/** Broadcasts a cart-mutation signal — any open useCartCount() hook will refetch. */
export function broadcastCartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

/**
 * Returns the current total item count across guest cart (zustand) or
 * the authenticated user's DB cart. The DB count is refreshed on:
 *   - mount
 *   - every `broadcastCartChanged()` call (i.e. after Add-to-RFQ mutations)
 *   - session transitions
 */
export function useCartCount(): number {
  const { status } = useSession();
  const guestCount = useGuestCart((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  const [authCount, setAuthCount] = useState(0);
  const isAuth = status === "authenticated";

  useEffect(() => {
    if (!isAuth) {
      setAuthCount(0);
      return;
    }

    let cancelled = false;
    async function fetchCount() {
      const map = await getCartQtyMapAction();
      if (cancelled) return;
      const total = Object.values(map).reduce((a, b) => a + b, 0);
      setAuthCount(total);
    }

    fetchCount();
    window.addEventListener(CART_CHANGED_EVENT, fetchCount);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_CHANGED_EVENT, fetchCount);
    };
  }, [isAuth]);

  return isAuth ? authCount : guestCount;
}
