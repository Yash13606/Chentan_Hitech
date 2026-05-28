"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Minus, Plus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGuestCart } from "@/lib/cart-store";
import { broadcastCartChanged } from "@/lib/use-cart-count";
import { setDbCartQtyByProductAction } from "@/server/actions/cart";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Props = {
  productId: string;
  title: string;
  sku: string;
  slug: string;
  priceCents: number | null;
  /** Initial qty from the server (DB cart for authed users). 0 for guests / new items. */
  initialQty?: number;
};

const QTY_MAX = 99;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export function RfqAddButton({
  productId,
  title,
  sku,
  slug,
  priceCents,
  initialQty = 0,
}: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // ── Guest cart state (zustand) ─────────────────────
  const guestQty = useGuestCart((s) =>
    s.items.find((i) => i.productId === productId)?.qty ?? 0
  );
  const addGuestItem = useGuestCart((s) => s.addItem);
  const updateGuestQty = useGuestCart((s) => s.updateQty);

  // ── Auth qty: optimistic local, server-backed ──────
  const [authQty, setAuthQty] = useState(initialQty);

  // Reconcile when initialQty changes (page refetched RSC) and when
  // session resolves from "loading" to a known state.
  useEffect(() => {
    setAuthQty(initialQty);
  }, [initialQty]);

  const qty = isLoggedIn ? authQty : guestQty;

  // ── Mutations ──────────────────────────────────────

  function persistAuthQty(next: number) {
    startTransition(async () => {
      const result = await setDbCartQtyByProductAction(productId, next);
      if (!result.ok) {
        setError(result.error);
        router.refresh();
        return;
      }
      // Tell the Nav badge + any other listeners to re-sync
      broadcastCartChanged();
    });
  }

  function changeBy(delta: number) {
    setError(null);
    const next = Math.max(0, Math.min(QTY_MAX, qty + delta));
    if (next === qty) return;

    if (isLoggedIn) {
      setAuthQty(next);
      persistAuthQty(next);
    } else {
      if (qty === 0 && delta > 0) {
        addGuestItem({
          productId,
          title,
          sku,
          slug,
          qty: 1,
          priceCents,
        });
      } else {
        updateGuestQty(productId, next);
      }
      // Guest cart is reactive via zustand; still notify for any non-store listeners
      broadcastCartChanged();
    }
  }

  function handleAdd() {
    changeBy(1);
  }

  // ── Loading / disabled while session resolves ──────
  if (status === "loading") {
    return (
      <div className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-border bg-muted/30 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </div>
    );
  }

  // ── State: nothing in cart yet → Add button ────────
  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {qty === 0 ? (
          <motion.button
            key="add"
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={cn(
              "group inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium transition-all",
              "bg-foreground text-background hover:opacity-90",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            aria-label={`Add ${title} to RFQ`}
          >
            {!isLoggedIn ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            Add to RFQ
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className={cn(
              "inline-flex items-center h-9 rounded-md border border-border bg-card overflow-hidden",
              isPending && "opacity-80"
            )}
          >
            <button
              type="button"
              onClick={() => changeBy(-1)}
              disabled={isPending}
              className="h-9 w-9 grid place-items-center text-foreground hover:bg-muted/60 transition-colors disabled:cursor-not-allowed"
              aria-label={qty === 1 ? `Remove ${title} from RFQ` : "Decrease quantity"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span
              className="h-9 min-w-9 px-1 grid place-items-center font-mono text-sm font-medium text-foreground tabular-nums border-x border-border bg-background"
              aria-live="polite"
              aria-label={`${qty} in RFQ`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={qty}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: EASE_OUT }}
                >
                  {qty}
                </motion.span>
              </AnimatePresence>
            </span>

            <button
              type="button"
              onClick={() => changeBy(1)}
              disabled={isPending || qty >= QTY_MAX}
              className="h-9 w-9 grid place-items-center text-foreground hover:bg-muted/60 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-cart confirmation chip */}
      {qty > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-medium grid place-items-center tabular-nums pointer-events-none"
          aria-hidden
        >
          ✓
        </span>
      )}

      {error && (
        <p className="absolute top-full left-0 mt-1 text-[11px] text-destructive whitespace-nowrap">
          {error}
        </p>
      )}

      {/* Hint for guests: explain they can add, will save on signup */}
      {!isLoggedIn && session === undefined && null}
    </div>
  );
}
