"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { COMPANY } from "@/lib/company";

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: EASE, delay },
  } as const;
}

export function Hero() {
  return (
    <section className="px-6 max-w-6xl mx-auto pt-12 pb-20 md:pt-20 md:pb-28">
      <motion.div
        {...fadeUp(0)}
        className="flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mb-8"
      >
        <span>Since {COMPANY.founded}</span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {COMPANY.contact.addressShort}
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.09)}
        className="font-heading font-medium tracking-[-0.01em] text-foreground text-[clamp(30px,6vw,72px)] leading-[1.08] max-w-5xl"
      >
        Commercial kitchen, laundry &amp; refrigeration equipment for India&apos;s{" "}
        <span className="text-muted-foreground">
          hospitality, healthcare &amp; defence
        </span>{" "}
        sectors.
      </motion.h1>

      <motion.p
        {...fadeUp(0.24)}
        className="mt-6 md:mt-8 text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
      >
        Wholesale and trade supply of 25+ partner brands — Rational, Unox,
        Electrolux, IFB, Alto-Shaam, Cambro and more. Pan-India dispatch with
        selective export.
      </motion.p>

      <motion.div
        {...fadeUp(0.36)}
        className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <Link href="/catalog">
          <IndustrialButton size="lg" className="gap-2">
            Browse Catalog
            <ArrowRight className="w-4 h-4" />
          </IndustrialButton>
        </Link>
        <Link href="/cart">
          <IndustrialButton size="lg" variant="secondary">
            Request a Quotation
          </IndustrialButton>
        </Link>
      </motion.div>
    </section>
  );
}
