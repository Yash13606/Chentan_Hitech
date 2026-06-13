import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";

import { getCatalogProducts, getCategories } from "@/server/dal/products";
import { auth } from "@/server/auth";
import { getCartQtyMapAction } from "@/server/actions/cart";
import { Nav } from "@/components/home/Nav";
import { Footer } from "@/components/home/Footer";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";

import { FilterOption } from "./FilterPanel";
import { CatalogClient } from "./CatalogClient";

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
        <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-10">
          <CatalogClient 
            categories={categories}
            industries={INDUSTRIES}
            availability={AVAILABILITY}
            totalResults={total}
            products={products}
            isLoggedIn={isLoggedIn}
            cartQtyMap={cartQtyMap}
            hasAnyFilter={hasAnyFilter}
            pages={pages}
            currentPage={currentPage}
            searchParamsRaw={{
               search: params.search,
               category: params.category,
               industry: params.industry,
               availability: params.availability
            }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
