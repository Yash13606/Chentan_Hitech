import { getCatalogProducts, getCategories } from "@/server/dal/products";
import { auth } from "@/server/auth";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";
import Link from "next/link";
import { Search } from "lucide-react";

const INDUSTRIES = [
  { value: "", label: "All Industries" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "DEFENCE", label: "Defence" },
  { value: "MARINE", label: "Marine" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "EDUCATION", label: "Education" },
  { value: "CORPORATE", label: "Corporate" },
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

  const [{ products, total, pages }, categories] = await Promise.all([
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
    getCategories(),
  ]);

  const currentPage = params.page ? parseInt(params.page) : 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-foreground px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-sans font-medium tracking-[0.4px] text-white/50 uppercase">
                Catalog
              </span>
              <h1 className="font-heading font-medium text-3xl text-white mt-1">
                Equipment Catalog
              </h1>
            </div>
            <p className="text-sm text-white/50 hidden sm:block">
              {total} products
              {!isLoggedIn && " · Sign in for pricing"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-56 shrink-0">
            <form method="GET" action="/catalog">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="search"
                  defaultValue={params.search}
                  type="search"
                  placeholder="Search SKU, name…"
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Industry */}
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Industry
                </p>
                <div className="space-y-1.5">
                  {INDUSTRIES.map((ind) => (
                    <label key={ind.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="industry"
                        value={ind.value}
                        defaultChecked={(params.industry ?? "") === ind.value}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{ind.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Category
                  </p>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        defaultChecked={!params.category}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">All Categories</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          defaultChecked={params.category === cat.id}
                          className="accent-primary"
                        />
                        <span className="text-sm text-foreground">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Availability
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: "", label: "All" },
                    { value: "IN_STOCK", label: "In Stock" },
                    { value: "MADE_TO_ORDER", label: "Made to Order" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        value={opt.value}
                        defaultChecked={(params.availability ?? "") === opt.value}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-foreground text-background text-sm font-medium py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                Apply Filters
              </button>
              {(params.search || params.category || params.industry || params.availability) && (
                <a
                  href="/catalog"
                  className="block text-center text-xs text-muted-foreground mt-2 hover:text-foreground"
                >
                  Clear all filters
                </a>
              )}
            </form>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {!isLoggedIn && (
              <div className="border border-border rounded-md bg-card px-4 py-3 mb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Pricing is available to registered buyers.
                </p>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-foreground underline underline-offset-4 whitespace-nowrap"
                >
                  Request access
                </Link>
              </div>
            )}

            {products.length === 0 ? (
              <div className="border border-border rounded-md bg-card p-12 text-center">
                <p className="font-heading font-medium text-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
                <a href="/catalog" className="inline-block mt-4 text-sm font-medium text-foreground underline underline-offset-4">
                  Clear filters
                </a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <IndustrialProductCard
                      key={product.id}
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
                    />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {currentPage > 1 && (
                      <a
                        href={`/catalog?${new URLSearchParams({ ...params, page: String(currentPage - 1) })}`}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors"
                      >
                        Previous
                      </a>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {pages}
                    </span>
                    {currentPage < pages && (
                      <a
                        href={`/catalog?${new URLSearchParams({ ...params, page: String(currentPage + 1) })}`}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors"
                      >
                        Next
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
