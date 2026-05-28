"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { StaggerGrid, StaggerItem } from "@/components/animation";

const EASE = [0.16, 1, 0.3, 1] as const;

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

      <StaggerGrid
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden"
        stagger={0.05}
        delay={0.1}
      >
        {categories.map((cat) => (
          <StaggerItem key={cat.id}>
            <Link
              href={`/catalog?category=${cat.slug}`}
              className="group bg-card p-6 flex flex-col justify-between hover:bg-secondary/40 transition-colors min-h-[180px] h-full"
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
          </StaggerItem>
        ))}
      </StaggerGrid>
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="flex flex-col items-start max-w-3xl">
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mb-3"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, ease: EASE, delay: eyebrow ? 0.07 : 0 }}
        className="font-heading font-medium tracking-tight text-3xl md:text-4xl text-foreground leading-tight"
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: EASE, delay: eyebrow ? 0.15 : 0.08 }}
          className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}
