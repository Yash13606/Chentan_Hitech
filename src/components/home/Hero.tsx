import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { COMPANY } from "@/lib/company";

/**
 * Hero — editorial, restrained. Says exactly what Chetan Hi-Tech does,
 * who it's for, and how long it has been doing it. No marketing fluff.
 */
export function Hero() {
  return (
    <section className="px-6 max-w-6xl mx-auto pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Eyebrow */}
      <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mb-8">
        <span>Since {COMPANY.founded}</span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {COMPANY.contact.addressShort}
        </span>
      </div>

      {/* Headline — full-width display serif */}
      <h1 className="font-heading font-medium tracking-[-0.01em] text-foreground text-[clamp(38px,6vw,72px)] leading-[1.05] max-w-5xl">
        Commercial kitchen, laundry &amp; refrigeration equipment for India&apos;s{" "}
        <span className="text-muted-foreground">
          hospitality, healthcare &amp; defence
        </span>{" "}
        sectors.
      </h1>

      {/* Sub */}
      <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        Wholesale and trade supply of 25+ partner brands — Rational, Unox,
        Electrolux, IFB, Alto-Shaam, Cambro and more. Pan-India dispatch with
        selective export.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
      </div>
    </section>
  );
}
