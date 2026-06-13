"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";
import { SectionHeader } from "./CategoryGrid";
import { StaggerGrid, StaggerItem, FadeUp } from "@/components/animation";

type FeaturedProduct = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string | null;
  availability: "IN_STOCK" | "MADE_TO_ORDER" | "DISCONTINUED";
  specs: unknown;
  brand: string | null;
  category: { name: string };
};

function topSpecs(specs: unknown): { label: string; value: string }[] {
  if (!specs || typeof specs !== "object") return [];
  return Object.entries(specs as Record<string, unknown>)
    .filter(([k]) => k !== "brand")
    .slice(0, 4)
    .map(([k, v]) => ({ label: humanise(k), value: String(v) }));
}

function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function FeaturedProducts({
  products,
  isLoggedIn,
}: {
  products: FeaturedProduct[];
  isLoggedIn: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="Featured"
        title="Equipment in demand right now"
        sub="A curated selection of best-sellers and signature platforms across cooking, refrigeration, laundry and service."
      />

      <StaggerGrid
        className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        stagger={0.08}
        delay={0.1}
      >
        {products.slice(0, 3).map((p) => (
          <StaggerItem key={p.id}>
            <IndustrialProductCard
              productId={p.id}
              title={p.title}
              category={p.category.name}
              slug={p.slug}
              sku={p.sku}
              imagePlaceholder={p.title}
              specs={topSpecs(p.specs)}
              availability={
                p.availability === "IN_STOCK"
                  ? "in-stock"
                  : p.availability === "MADE_TO_ORDER"
                    ? "made-to-order"
                    : "low-stock"
              }
              isLoggedIn={isLoggedIn}
            />
          </StaggerItem>
        ))}
      </StaggerGrid>

      <FadeUp delay={0.4} className="mt-14 flex justify-center">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 border border-border bg-card/40 hover:bg-muted/50 text-foreground text-sm font-medium py-3 px-8 transition-colors duration-300"
        >
          View Full Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </FadeUp>
    </section>
  );
}
