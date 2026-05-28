"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  MessageSquare,
  AlertCircle,
  Calendar,
  ShoppingCart,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Nav } from "@/components/home/Nav";
import { Footer } from "@/components/home/Footer";
import { useGuestCart } from "@/lib/cart-store";
import {
  getDbCartAction,
  removeFromDbCartAction,
  updateDbCartItemQtyAction,
  type DbCart,
} from "@/server/actions/cart";
import { submitRfqAction, type RfqFormState } from "@/server/actions/rfq";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type CartRow = {
  id: string; // cartItem id (for DB) or productId (for guest)
  productId: string;
  title: string;
  sku: string;
  qty: number;
  priceCents: number | null;
  notes?: string | null;
};

// ─────────────────────────────────────────────────────
// SUBMIT BUTTON
// ─────────────────────────────────────────────────────

function SubmitButton({
  disabled,
  pending,
}: {
  disabled: boolean;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full h-12 bg-primary text-primary-foreground rounded-md text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating Quotation…
        </>
      ) : (
        "Get Quotation Now"
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-medium text-xl text-foreground mb-2">
            Your RFQ cart is empty
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Browse the catalog and add products to get a quotation.
          </p>
          <Link
            href="/catalog"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────

export default function CartPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Guest cart
  const guestItems = useGuestCart((s) => s.items);
  const guestRemove = useGuestCart((s) => s.removeItem);
  const guestUpdateQty = useGuestCart((s) => s.updateQty);

  // DB cart state
  const [dbCart, setDbCart] = useState<DbCart | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Load DB cart when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingCart(true);
    getDbCartAction()
      .then(setDbCart)
      .finally(() => setLoadingCart(false));
  }, [isAuthenticated]);

  // Build unified cart rows
  const cartRows: CartRow[] = isAuthenticated
    ? (dbCart?.items ?? []).map((i) => ({
        id: i.id,
        productId: i.product.id,
        title: i.product.title,
        sku: i.product.sku,
        qty: i.qty,
        priceCents: i.product.priceCents,
        notes: i.notes,
      }))
    : guestItems.map((i) => ({
        id: i.productId,
        productId: i.productId,
        title: i.title,
        sku: i.sku,
        qty: i.qty,
        priceCents: i.priceCents,
      }));

  const totalUnits = cartRows.reduce((sum, r) => sum + r.qty, 0);

  // ── Mutations ──────────────────────────────────────

  function handleRemove(row: CartRow) {
    if (isAuthenticated) {
      startTransition(async () => {
        await removeFromDbCartAction(row.id);
        setDbCart((prev) =>
          prev
            ? { ...prev, items: prev.items.filter((i) => i.id !== row.id) }
            : null
        );
      });
    } else {
      guestRemove(row.productId);
    }
  }

  function handleQtyChange(row: CartRow, qty: number) {
    if (isAuthenticated) {
      startTransition(async () => {
        await updateDbCartItemQtyAction(row.id, qty);
        setDbCart((prev) =>
          prev
            ? {
                ...prev,
                items:
                  qty <= 0
                    ? prev.items.filter((i) => i.id !== row.id)
                    : prev.items.map((i) => (i.id === row.id ? { ...i, qty } : i)),
              }
            : null
        );
      });
    } else {
      guestUpdateQty(row.productId, qty);
    }
  }

  // ── RFQ form state ──────────────────────────────────

  const [rfqState, rfqAction, isSubmitting] = useActionState<RfqFormState, FormData>(
    submitRfqAction,
    {}
  );

  // Redirect on success
  useEffect(() => {
    if (rfqState.inquiryNumber) {
      router.push(`/portal?rfq=${rfqState.inquiryNumber}`);
    }
  }, [rfqState.inquiryNumber, router]);

  // ── Loading / empty states ──────────────────────────

  if (status === "loading" || loadingCart) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center pt-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (cartRows.length === 0) return <EmptyCart />;

  // ── Main render ──────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-1 pt-24 pb-10 px-6 container mx-auto max-w-6xl">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" /> Continue browsing
        </Link>
        <div className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-normal mb-3">
            Get Your Quotation
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Review your selected equipment and click <strong>Get Quotation Now</strong>{" "}
            — we'll generate an indicative PDF instantly using current catalog pricing.
            When you're ready to finalize, request a meeting and our team will confirm
            the final price.
          </p>
        </div>

        <form action={rfqAction}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Equipment list */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="border border-border rounded-md overflow-hidden bg-card">
                <div className="border-b border-border px-5 py-4 bg-muted/20 flex items-center justify-between">
                  <h2 className="font-heading font-medium text-base text-foreground">
                    Equipment List
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {cartRows.length} product{cartRows.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {cartRows.map((row) => (
                    <div key={row.id} className="px-5 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm leading-snug">
                          {row.title}
                        </p>
                        <span className="font-mono text-xs text-muted-foreground">
                          {row.sku}
                        </span>
                        {row.priceCents && (
                          <span className="ml-3 text-xs text-muted-foreground">
                            ₹{(row.priceCents / 100).toLocaleString("en-IN")} / unit
                          </span>
                        )}
                      </div>

                      {/* Qty */}
                      <input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={(e) =>
                          handleQtyChange(row, parseInt(e.target.value) || 1)
                        }
                        className="w-16 h-9 text-center border border-border rounded-md bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemove(row)}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project requirements — all optional; included on the PDF for context */}
              <div className="border border-border rounded-md bg-card p-5">
                <h2 className="font-heading font-medium text-base text-foreground mb-1">
                  Project Details
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  All fields optional. These help us prepare for the discussion.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="URGENT">Urgent</option>
                      <option value="PLANNING">Planning phase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <Calendar className="inline w-3.5 h-3.5 mr-1" />
                      Delivery Timeline
                    </label>
                    <select
                      name="deliveryTimeline"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Not specified</option>
                      <option value="1-2 weeks">Immediate (1–2 weeks)</option>
                      <option value="30 days">Next 30 days</option>
                      <option value="3+ months">Planning phase (3+ months)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Delivery Location
                    </label>
                    <input
                      name="deliveryLocation"
                      type="text"
                      placeholder="City / State"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <MessageSquare className="inline w-3.5 h-3.5 mr-1" />
                      Project Notes
                    </label>
                    <textarea
                      name="projectNotes"
                      rows={3}
                      placeholder="Site constraints, voltage requirements, special configurations…"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="border border-border rounded-md bg-card p-5 sticky top-24 space-y-5">
                <h2 className="font-heading font-medium text-base text-foreground">
                  Summary
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Products</span>
                    <span>{cartRows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total units</span>
                    <span className="font-mono">{totalUnits}</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your PDF quotation is generated instantly using catalog pricing
                    (GST 18% included). Final pricing is confirmed during a brief
                    meeting with our team.
                  </p>
                </div>

                {rfqState.error && (
                  <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                    {rfqState.error}
                  </p>
                )}

                {isAuthenticated ? (
                  <SubmitButton
                    disabled={cartRows.length === 0}
                    pending={isSubmitting}
                  />
                ) : (
                  <Link
                    href="/login?callbackUrl=/cart"
                    className="block w-full text-center h-12 leading-[3rem] bg-primary text-primary-foreground rounded-md text-base font-medium hover:opacity-90 transition-opacity"
                  >
                    Login to get quotation
                  </Link>
                )}

                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    Your cart is saved locally and will persist after login.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
