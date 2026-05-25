"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProductAction } from "@/server/actions/admin/products";
import Link from "next/link";
import { useEffect, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Creating…" : "Create Product"}
    </button>
  );
}

export default function NewProductPage() {
  const [state, action] = useActionState(createProductAction, {});
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
            ← Products
          </Link>
          <h1 className="font-heading font-medium text-xl text-foreground mt-1">New Product</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {state.error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2 mb-4">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">SKU *</label>
              <input
                name="sku"
                required
                placeholder="KCH-COM-10G"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {state.fieldErrors?.sku && (
                <p className="text-xs text-destructive mt-1">{state.fieldErrors.sku[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
              <select
                name="categoryId"
                required
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              name="title"
              required
              placeholder="Commercial Combi Oven 10-Grid"
              className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Availability</label>
              <select
                name="availability"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="MADE_TO_ORDER">Made to Order</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Price (₹) <span className="text-muted-foreground font-normal">optional</span>
              </label>
              <input
                name="priceCents"
                type="number"
                step="100"
                placeholder="125000"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter price in rupees</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center gap-3">
            <SubmitButton />
            <Link
              href="/admin/products"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
