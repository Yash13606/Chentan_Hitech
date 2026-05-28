import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";

import { getCatalogProducts, getCategories } from "@/server/dal/products";
import { auth } from "@/server/auth";
import { getCartQtyMapAction } from "@/server/actions/cart";
import { Nav } from "@/components/home/Nav";
import { Footer } from "@/components/home/Footer";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";

import { FilterPanel, type FilterOption } from "./FilterPanel";
import { ActiveFilters } from "./ActiveFilters";

const INDUSTRIES: FilterOption[] = [
  { value: "", label: "All industries" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "DEFENCE", label: "Defence" },
  { value: "MARINE", label: "Marine" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "EDUCATION", label: "Education" },
  { value: "CORPORATE", label: "Corporate" },
];

const AVAILABILITY: FilterOption[] = [
  { value: "", label: "All availability" },
  { value: "IN_STOCK", label: "In stock" },
  { value: "MADE_TO_ORDER", label: "Made to order" },
];

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    industry?: string;
    availability?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  const [{ products, total, pages }, categoriesRaw, cartQtyMap] = await Promise.all([
    getCatalogProducts(
      {
        search: params.search,
        categoryId: params.category,
        industryType: params.industry,
        availability: params.availability,
        page: params.page ? parseInt(params.page) : 1,
        perPage: 24,
      },
      isLoggedIn
    ),
    getCategories().catch(() => []),
    isLoggedIn
      ? getCartQtyMapAction()
      : Promise.resolve<Record<string, number>>({}),
  ]);

  const categories: FilterOption[] = [
    { value: "", label: "All categories" },
    ...categoriesRaw.map((c) => ({ value: c.id, label: c.name })),
  ];

  const currentPage = params.page ? parseInt(params.page) : 1;
  const hasAnyFilter = !!(
    params.search ||
    params.category ||
    params.industry ||
    params.availability
  );

  // Build pagination links — preserves all other params
  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.category) sp.set("category", params.category);
    if (params.industry) sp.set("industry", params.industry);
    if (params.availability) sp.set("availability", params.availability);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-1 pt-24 pb-20">
        {/* ── Editorial header ──────────────────────────────────── */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-muted-foreground mb-3">
                  Catalog · Equipment Index
                </p>
                <h1 className="font-heading font-medium text-3xl md:text-5xl tracking-tight leading-[1.05]">
                  Industrial equipment, indexed.
                </h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed max-w-xl">
                  Commercial kitchen, laundry, refrigeration, and housekeeping
                  systems built for hotels, hospitals, defence, and marine
                  operations.
                </p>
              </div>

              <div className="flex items-baseline gap-2 font-mono text-sm text-muted-foreground shrink-0">
                <span className="text-2xl font-medium text-foreground tabular-nums">
                  {total.toLocaleString("en-IN")}
                </span>
                <span>{total === 1 ? "product" : "products"}</span>
                {!isLoggedIn && (
                  <span className="hidden sm:inline pl-2 ml-2 border-l border-border">
                    pricing on sign in
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Body grid ─────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            <FilterPanel
              categories={categories}
              industries={INDUSTRIES}
              availability={AVAILABILITY}
              totalResults={total}
            />

            <section className="flex-1 min-w-0">
              {!isLoggedIn && (
                <div className="rounded-md bg-card border border-border px-5 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                    className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Request access
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <ActiveFilters industries={INDUSTRIES} categories={categories} />

              {products.length === 0 ? (
                <EmptyState hasFilters={hasAnyFilter} />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                          className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                          scroll={false}
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Previous
                        </Link>
                      ) : (
                        <span aria-hidden />
                      )}

                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        <span className="text-foreground font-medium">
                          {currentPage}
                        </span>
                        <span className="mx-1">/</span>
                        <span>{pages}</span>
                      </span>

                      {currentPage < pages ? (
                        <Link
                          href={pageHref(currentPage + 1)}
                          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                          scroll={false}
                        >
                          Next
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card px-8 py-16 text-center">
      <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-muted/60 grid place-items-center text-muted-foreground">
        <Inbox className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-xl font-medium text-foreground">
        {hasFilters ? "Nothing matches that combination." : "Catalog is empty."}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
        {hasFilters
          ? "Try removing a filter, or search by SKU directly. Our team can also source equipment that isn't listed yet."
          : "Products will appear here once the catalog has been populated."}
      </p>
      {hasFilters && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Clear filters
          </Link>
          <Link
            href="/inquiry"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            Request sourcing
          </Link>
        </div>
      )}
    </div>
  );
}
