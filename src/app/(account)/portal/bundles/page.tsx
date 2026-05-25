"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, ShoppingCart, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import {
  createBundleAction,
  deleteBundleAction,
  addBundleToCartAction,
  type BundleState,
} from "@/server/actions/bundles";

type BundleItem = {
  id: string;
  qty: number;
  notes: string | null;
  product: { id: string; title: string; sku: string };
};

type Bundle = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  items: BundleItem[];
};

export default function BundlesPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createState, createAction] = useActionState<BundleState, FormData>(createBundleAction, {});

  useEffect(() => {
    fetchBundles();
  }, []);

  useEffect(() => {
    if (createState.success) {
      setShowCreate(false);
      fetchBundles();
    }
  }, [createState]);

  async function fetchBundles() {
    setLoading(true);
    const res = await fetch("/api/portal/bundles");
    if (res.ok) {
      const data = await res.json() as Bundle[];
      setBundles(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bundle?")) return;
    await deleteBundleAction(id);
    fetchBundles();
  }

  async function handleAddToCart(id: string, name: string) {
    const result = await addBundleToCartAction(id);
    if (result.success) {
      setCartSuccess(name);
      setTimeout(() => setCartSuccess(null), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/portal" className="text-xs text-muted-foreground hover:text-foreground">← Dashboard</Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">Saved Bundles</h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New Bundle
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Cart success toast */}
        {cartSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 flex items-center gap-2 text-sm text-green-800">
            <ShoppingCart className="w-4 h-4" />
            <span>&quot;{cartSuccess}&quot; items added to your cart.</span>
            <Link href="/cart" className="ml-auto text-green-700 underline underline-offset-2 font-medium whitespace-nowrap">View Cart</Link>
          </div>
        )}

        {/* Create bundle form */}
        {showCreate && (
          <div className="border border-border rounded-md bg-card p-5">
            <h2 className="font-medium text-sm text-foreground mb-4">Create New Bundle</h2>
            <form action={createAction} className="space-y-3">
              <input
                name="name"
                required
                placeholder="Bundle name (e.g. Hospital Laundry Setup)"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <textarea
                name="description"
                rows={2}
                placeholder="Description (optional)"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              {createState.error && (
                <p className="text-xs text-destructive">{createState.error}</p>
              )}
              <div className="flex gap-2">
                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                  Create Bundle
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bundle list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading bundles...</div>
        ) : bundles.length === 0 ? (
          <div className="border border-border rounded-md bg-card p-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-heading font-medium text-foreground mb-2">No bundles yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Save a collection of equipment for quick reuse across multiple RFQs.
            </p>
            <Link href="/catalog" className="text-sm font-medium text-foreground underline underline-offset-4">
              Browse catalog to find products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="border border-border rounded-md bg-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground">{bundle.name}</p>
                    {bundle.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{bundle.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {bundle.items.length} item{bundle.items.length !== 1 ? "s" : ""} &middot;{" "}
                      {new Date(bundle.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAddToCart(bundle.id, bundle.name)}
                      className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleDelete(bundle.id)}
                      className="flex items-center text-xs text-destructive hover:bg-destructive/10 px-2 py-1.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [bundle.id]: !prev[bundle.id] }))}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expanded[bundle.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expanded[bundle.id] && bundle.items.length > 0 && (
                  <div className="border-t border-border divide-y divide-border">
                    {bundle.items.map((item) => (
                      <div key={item.id} className="px-5 py-3 flex items-center justify-between text-sm">
                        <div>
                          <span className="text-foreground">{item.product.title}</span>
                          <span className="font-mono text-xs text-muted-foreground ml-2">{item.product.sku}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Qty: {item.qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border border-border rounded-md bg-card p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Add products to a bundle from any{" "}
          <Link href="/catalog" className="underline underline-offset-2 text-foreground">product page</Link>. Then &quot;Add to Cart&quot; here to instantly populate your RFQ.
        </div>
      </div>
    </div>
  );
}
