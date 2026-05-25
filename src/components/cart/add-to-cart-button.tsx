"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useGuestCart } from "@/lib/cart-store";
import { addToDbCartAction } from "@/server/actions/cart";

type Props = {
  productId: string;
  title: string;
  sku: string;
  slug: string;
  priceCents: number | null;
  defaultQty?: number;
  className?: string;
};

export function AddToCartButton({
  productId,
  title,
  sku,
  slug,
  priceCents,
  defaultQty = 1,
  className,
}: Props) {
  const { data: session } = useSession();
  const addGuestItem = useGuestCart((s) => s.addItem);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    startTransition(async () => {
      if (session?.user) {
        // Logged-in: persist to DB
        await addToDbCartAction(productId, defaultQty);
      } else {
        // Guest: persist to localStorage via Zustand
        addGuestItem({ productId, title, sku, slug, qty: defaultQty, priceCents });
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      className={
        className ??
        "flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      }
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : added ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {isPending ? "Adding…" : added ? "Added!" : "Add to RFQ"}
    </button>
  );
}
