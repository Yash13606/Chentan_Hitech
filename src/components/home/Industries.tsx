"use client";

import Link from "next/link";
import {
  Building2,
  UtensilsCrossed,
  Stethoscope,
  Shield,
  Anchor,
  Factory,
  ArrowUpRight,
} from "lucide-react";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { StaggerGrid, StaggerItem } from "@/components/animation";

const EASE = [0.16, 1, 0.3, 1] as const;

const INDUSTRIES = [
  {
    icon: Building2,
    name: "Hospitality",
    description: "Hotels, resorts, banquets and serviced apartments.",
    slug: "hospitality",
    n: "01",
  },
  {
    icon: UtensilsCrossed,
    name: "Restaurant",
    description: "Standalone restaurants, cafés and quick-service.",
    slug: "restaurant",
    n: "02",
  },
  {
    icon: Stethoscope,
    name: "Healthcare",
    description: "Hospital kitchens, CSSD and patient-care laundries.",
    slug: "healthcare",
    n: "03",
  },
  {
    icon: Shield,
    name: "Defence",
    description: "Army messes, Navy galleys, Air Force station kitchens.",
    slug: "defence",
    n: "04",
  },
  {
    icon: Anchor,
    name: "Marine",
    description: "Cruise lines, coast guard and offshore platforms.",
    slug: "marine",
    n: "05",
  },
  {
    icon: Factory,
    name: "Industrial Kitchens",
    description: "Bulk cooking, central kitchens, large canteens.",
    slug: "industrial-kitchens",
    n: "06",
  },
] as const;

export function Industries() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="bg-foreground text-background py-20 md:py-28">
      <div className="px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="text-[11px] font-medium tracking-[0.18em] uppercase text-background/50 mb-3 block"
            >
              Industries we serve
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.07 }}
              className="font-heading font-medium tracking-tight text-3xl md:text-4xl text-background leading-tight max-w-lg"
            >
              A decade of equipping India&apos;s most demanding kitchens.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
            className="text-sm text-background/55 leading-relaxed md:max-w-xs md:text-right shrink-0"
          >
            From 200-cover hotel banquets to Navy galleys at sea, we&apos;ve
            supplied equipment to clients who can&apos;t afford downtime.
          </motion.p>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="mt-10 h-px bg-background/10 origin-left"
        />

        {/* Grid */}
        <StaggerGrid
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          stagger={0.07}
          delay={0.1}
        >
          {INDUSTRIES.map((ind) => (
            <StaggerItem key={ind.slug}>
              <Link
                href={`/catalog?industry=${ind.slug.toUpperCase().replace(/-/g, "_")}`}
                className="group relative flex flex-col justify-between min-h-[220px] p-6 rounded-xl border border-background/[0.12] hover:border-background/25 transition-colors duration-300 overflow-hidden h-full"
              >
                {/* Top accent line — reveals on hover */}
                <span className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

                {/* Hover background tint */}
                <span className="absolute inset-0 bg-background/0 group-hover:bg-background/[0.04] transition-colors duration-300 rounded-xl pointer-events-none" />

                {/* Top row: number + icon */}
                <div className="relative z-10 flex items-start justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-background/30 group-hover:text-background/50 transition-colors duration-300">
                    {ind.n}
                  </span>
                  <ind.icon
                    className="w-6 h-6 text-background/45 group-hover:text-background/85 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Bottom: name + description */}
                <div className="relative z-10">
                  <h3 className="font-heading text-[22px] font-medium text-background leading-tight tracking-tight">
                    {ind.name}
                  </h3>
                  <p className="mt-2 text-[13px] text-background/55 leading-relaxed">
                    {ind.description}
                  </p>
                </div>

                {/* Arrow — appears on hover */}
                <ArrowUpRight
                  className="absolute bottom-5 right-5 w-[14px] h-[14px] opacity-0 group-hover:opacity-40 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
                  aria-hidden
                />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
