import { Star } from "lucide-react";
import { HOMEPAGE_TESTIMONIALS } from "@/lib/testimonials";
import { COMPANY } from "@/lib/company";
import { SectionHeader } from "./CategoryGrid";

export function Testimonials() {
  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
        <SectionHeader
          eyebrow="Customer voices"
          title="What clients across India tell us"
          sub={`${COMPANY.trust.rating} / 5 across ${COMPANY.trust.reviewCount} verified reviews.`}
        />
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-foreground stroke-foreground"
            />
          ))}
          <span className="ml-2 font-mono text-[13px] tracking-tight text-foreground">
            {COMPANY.trust.rating} / 5
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HOMEPAGE_TESTIMONIALS.map((t) => (
          <figure
            key={t.id}
            className="rounded-xl border border-border bg-card p-7 flex flex-col gap-6"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-foreground stroke-foreground"
                />
              ))}
            </div>
            <blockquote className="font-heading text-lg leading-snug text-foreground flex-1">
              {t.quote ? `“${t.quote}”` : "“Five-star review — no comment provided.”"}
            </blockquote>
            <figcaption className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
              <p className="text-[11px] font-mono tracking-tight text-muted-foreground/70 mt-2">
                Re: {t.product}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
