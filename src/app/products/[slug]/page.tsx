import { getProductBySlug } from "@/server/dal/products";
import { auth } from "@/server/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Lock, ArrowLeft } from "lucide-react";
import { Nav } from "@/components/home/Nav";
import { Footer } from "@/components/home/Footer";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  const product = await getProductBySlug(slug, isLoggedIn);
  if (!product) notFound();

  const specs = Array.isArray(product.specs)
    ? (product.specs as { label: string; value: string }[])
    : Object.entries(product.specs as Record<string, string>).map(([label, value]) => ({
        label,
        value: String(value),
      }));

  const availability =
    product.availability === "IN_STOCK"
      ? "success"
      : product.availability === "MADE_TO_ORDER"
      ? "neutral"
      : "warning";

  const availabilityLabel =
    product.availability === "IN_STOCK"
      ? "Ready Stock"
      : product.availability === "MADE_TO_ORDER"
      ? "Made to Order"
      : "Discontinued";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">
            Home
          </Link>
          <span className="shrink-0">/</span>
          <Link href="/catalog" className="hover:text-foreground transition-colors shrink-0">
            Catalog
          </Link>
          <span className="hidden sm:inline shrink-0">/</span>
          <Link
            href={`/catalog?category=${product.category.slug}`}
            className="hidden sm:inline hover:text-foreground transition-colors shrink-0"
          >
            {product.category.name}
          </Link>
          <span className="hidden sm:inline shrink-0">/</span>
          <span className="hidden sm:inline text-foreground truncate max-w-[200px] md:max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground font-mono text-sm">[Product Image]</p>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={availability}>{availabilityLabel}</StatusBadge>
              <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
            </div>

            <h1 className="font-heading font-medium text-3xl text-foreground mb-2">
              {product.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>

            {product.industries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 mb-6">
                {product.industries.map(({ industry }) => (
                  <span
                    key={industry.slug}
                    className="text-xs border border-border rounded-full px-2.5 py-0.5 text-muted-foreground"
                  >
                    {industry.name}
                  </span>
                ))}
              </div>
            )}

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Specs table */}
            {specs.length > 0 && (
              <div className="border border-border rounded-md overflow-hidden mb-6">
                <div className="grid divide-y divide-border">
                  {specs.map((spec, i) => (
                    <div key={i} className="grid grid-cols-2 px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">{spec.label}</span>
                      <span className="font-mono text-sm text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              {isLoggedIn ? (
                "priceCents" in product && product.priceCents ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Indicative price</p>
                    <p className="font-heading font-medium text-2xl text-foreground">
                      {formatPrice(product.priceCents)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Final pricing in official quotation. Subject to volume and project scope.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pricing available on quotation request.
                  </p>
                )
              ) : (
                <div className="border border-border rounded-md bg-card px-4 py-3 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pricing requires registration
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <Link href="/signup" className="underline underline-offset-2">
                        Create a free account
                      </Link>{" "}
                      to unlock pricing and submit an RFQ.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <AddToCartButton
                productId={product.id}
                title={product.title}
                sku={product.sku}
                slug={product.slug}
                priceCents={"priceCents" in product ? (product.priceCents ?? null) : null}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              />
              <Link href="/catalog">
                <IndustrialButton variant="secondary">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Catalog
                </IndustrialButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
