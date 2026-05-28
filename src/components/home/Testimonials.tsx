"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";
import { COMPANY } from "@/lib/company";
import { SectionHeader } from "./CategoryGrid";
import { FadeUp } from "@/components/animation";

function TestimonialsColumn({
  testimonials,
  duration = 20,
  className,
}: {
  testimonials: readonly Testimonial[];
  duration?: number;
  className?: string;
}) {
  const items = [...testimonials, ...testimonials];
  return (
    <div
      className={`flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] ${className ?? ""}`}
    >
      <motion.div
        animate={{ y: "-50%" }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
        className="flex flex-col gap-4"
      >
        {items.map((t, i) => (
          <figure
            key={`${t.id}-${i}`}
            className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-foreground stroke-foreground" />
              ))}
            </div>
            <blockquote className="font-heading text-[15px] leading-snug text-foreground flex-1">
              &ldquo;{t.quote || "Five-star review — no comment provided."}&rdquo;
            </blockquote>
            <figcaption className="pt-3 border-t border-border">
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
              <p className="text-[11px] font-mono tracking-tight text-muted-foreground/60 mt-1.5">
                Re: {t.product}
              </p>
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  );
}

const COL1: Testimonial[] = [TESTIMONIALS[0], TESTIMONIALS[2], TESTIMONIALS[4]];
const COL2: Testimonial[] = [TESTIMONIALS[1], TESTIMONIALS[3], TESTIMONIALS[0]];
const COL3: Testimonial[] = [TESTIMONIALS[2], TESTIMONIALS[4], TESTIMONIALS[1]];

export function Testimonials() {
  return (
    <section className="py-20 md:py-24 overflow-hidden">
      <div className="px-6 max-w-6xl mx-auto mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeader
            eyebrow="Customer voices"
            title="What clients across India tell us"
            sub={`${COMPANY.trust.rating} / 5 across ${COMPANY.trust.reviewCount} verified reviews.`}
          />
          <FadeUp delay={0.2} className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-foreground stroke-foreground" />
            ))}
            <span className="ml-2 font-mono text-[13px] tracking-tight text-foreground">
              {COMPANY.trust.rating} / 5
            </span>
          </FadeUp>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-5 h-[420px] sm:h-[500px] md:h-[560px]">
          <TestimonialsColumn testimonials={COL1} duration={20} />
          <TestimonialsColumn testimonials={COL2} duration={26} className="hidden md:block" />
          <TestimonialsColumn testimonials={COL3} duration={17} className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
