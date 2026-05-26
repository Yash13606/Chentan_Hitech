import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type CategoryCard = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

export function CategoryGrid({ categories }: { categories: CategoryCard[] }) {
  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="Catalog"
        title="Browse by category"
        sub="Ten product families, from combi ovens to housekeeping carts. Every item is sourced from a vetted partner brand."
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${cat.slug}`}
            className="group bg-card p-6 flex flex-col justify-between hover:bg-secondary/40 transition-colors min-h-[180px]"
          >
            <div>
              <h3 className="font-heading text-xl font-medium text-foreground tracking-tight leading-snug">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-tight text-muted-foreground">
                {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-start max-w-3xl">
      <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mb-3">
        {eyebrow}
      </span>
      <h2 className="font-heading font-medium tracking-tight text-3xl md:text-4xl text-foreground leading-tight">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}
