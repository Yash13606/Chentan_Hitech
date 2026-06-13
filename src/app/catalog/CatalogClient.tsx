"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PanelLeftClose, PanelLeftOpen, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

import { FilterPanel, type FilterOption } from "./FilterPanel";
import { ActiveFilters } from "./ActiveFilters";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";

interface CatalogClientProps {
  categories: FilterOption[];
  industries: FilterOption[];
  availability: FilterOption[];
  totalResults: number;
  products: any[];
  isLoggedIn: boolean;
  cartQtyMap: Record<string, number>;
  hasAnyFilter: boolean;
  pages: number;
  currentPage: number;
  searchParamsRaw: { search?: string; category?: string; industry?: string; availability?: string; };
}

export function CatalogClient({
  categories,
  industries,
  availability,
  totalResults,
  products,
  isLoggedIn,
  cartQtyMap,
  hasAnyFilter,
  pages,
  currentPage,
  searchParamsRaw,
}: CatalogClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Build pagination links
  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (searchParamsRaw.search) sp.set("search", searchParamsRaw.search);
    if (searchParamsRaw.category) sp.set("category", searchParamsRaw.category);
    if (searchParamsRaw.industry) sp.set("industry", searchParamsRaw.industry);
    if (searchParamsRaw.availability) sp.set("availability", searchParamsRaw.availability);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  }

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Desktop sidebar wrapping FilterPanel */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-500 ease-[0.16,1,0.3,1]",
          sidebarOpen ? "w-72 opacity-100 pr-4" : "w-0 opacity-0 overflow-hidden"
        )}
      >
        <FilterPanel
          categories={categories}
          industries={industries}
          availability={availability}
          totalResults={totalResults}
        />
      </div>

      <section className="flex-1 min-w-0 transition-all duration-500">
        {!isLoggedIn && (
          <div className="rounded-sm bg-surface-1 border border-border px-5 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Pricing is available to registered buyers.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full specifications and indicative pricing unlock after a
                30-second registration.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-mono uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Request access
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center gap-2 h-10 px-4 border border-border bg-surface-1 rounded-sm text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary hover:bg-surface-2 transition-all"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              {sidebarOpen ? "Hide Filters" : "Show Filters"}
            </button>
            <ActiveFilters industries={industries} categories={categories} />
          </div>
        </div>

        {/* Mobile FilterPanel (renders purely on mobile inside its own Sheet) */}
        <div className="lg:hidden mb-6">
          <FilterPanel
            categories={categories}
            industries={industries}
            availability={availability}
            totalResults={totalResults}
          />
        </div>

        {products.length === 0 ? (
          <EmptyState hasFilters={hasAnyFilter} />
        ) : (
          <>
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-5 transition-all duration-500",
                sidebarOpen ? "xl:grid-cols-3" : "xl:grid-cols-4"
              )}
            >
              {products.map((product) => (
                <IndustrialProductCard
                  key={product.id}
                  productId={product.id}
                  title={product.title}
                  category={product.category.name}
                  availability={
                    product.availability === "IN_STOCK"
                      ? "in-stock"
                      : "made-to-order"
                  }
                  specs={
                    Array.isArray(product.specs)
                      ? (product.specs as { label: string; value: string }[])
                      : []
                  }
                  slug={product.slug}
                  sku={product.sku}
                  priceCents={
                    "priceCents" in product
                      ? (product.priceCents ?? undefined)
                      : undefined
                  }
                  isLoggedIn={isLoggedIn}
                  initialQty={cartQtyMap[product.id] ?? 0}
                />
              ))}
            </div>

            {pages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-10 pt-8 border-t border-border flex items-center justify-between gap-4"
              >
                {currentPage > 1 ? (
                  <Link
                    href={pageHref(currentPage - 1)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-sm border border-border bg-surface-1 text-xs font-mono uppercase tracking-widest text-foreground hover:bg-surface-2 transition-colors"
                    scroll={false}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    [ Prev ]
                  </Link>
                ) : (
                  <span aria-hidden />
                )}

                <span className="font-mono text-xs tracking-widest text-muted-foreground tabular-nums">
                  <span className="text-foreground font-medium">
                    {currentPage}
                  </span>
                  <span className="mx-2">/</span>
                  <span>{pages}</span>
                </span>

                {currentPage < pages ? (
                  <Link
                    href={pageHref(currentPage + 1)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-sm bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-opacity"
                    scroll={false}
                  >
                    [ Next ]
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span aria-hidden />
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-sm border border-border bg-surface-1 px-8 py-20 text-center">
      <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-border bg-surface-2 flex items-center justify-center text-muted-foreground">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="font-heading text-2xl font-medium text-foreground tracking-tight">
        {hasFilters ? "No exact matches found." : "Catalog is empty."}
      </h3>
      <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
        {hasFilters
          ? "Broaden your search or clear filters to see more results. We can also custom source specific equipment."
          : "Industrial assets will appear here once provisioned."}
      </p>
      {hasFilters && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="inline-flex items-center h-11 px-6 rounded-sm bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </Link>
          <Link
            href="/inquiry"
            className="inline-flex items-center h-11 px-6 rounded-sm border border-border bg-transparent text-xs font-mono uppercase tracking-widest text-foreground hover:bg-surface-1 transition-colors"
          >
            Custom Sourcing
          </Link>
        </div>
      )}
    </div>
  );
}
