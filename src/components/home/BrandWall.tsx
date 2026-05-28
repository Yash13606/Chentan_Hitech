"use client";

import Link from "next/link";
import { HOMEPAGE_BRANDS } from "@/lib/brands";
import { SectionHeader } from "./CategoryGrid";
import { StaggerGrid, StaggerItem, FadeUp } from "@/components/animation";

export function BrandWall() {
  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="Partner brands"
        title="We distribute equipment from 25+ trusted manufacturers"
        sub="A curated portfolio across international and regional brands — chosen for build quality, service network, and lifecycle economics."
      />

      <StaggerGrid
        className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border border border-border rounded-xl overflow-hidden"
        stagger={0.04}
        delay={0.1}
      >
        {HOMEPAGE_BRANDS.map((brand) => (
          <StaggerItem key={brand.slug}>
            <Link
              href={`/catalog?brand=${brand.slug}`}
              className="bg-card aspect-[3/2] flex items-center justify-center px-4 hover:bg-secondary/40 transition-colors group h-full w-full"
              title={brand.blurb}
            >
              <span className="font-heading text-base md:text-lg font-medium tracking-tight text-foreground/80 group-hover:text-foreground transition-colors text-center">
                {brand.name}
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <FadeUp delay={0.2} className="mt-8 flex justify-center">
        <Link
          href="/brands"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4"
        >
          See the full list of partner brands
        </Link>
      </FadeUp>
    </section>
  );
}
