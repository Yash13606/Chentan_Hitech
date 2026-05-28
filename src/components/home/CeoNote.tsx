"use client";

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { COMPANY } from "@/lib/company";
import { FadeUp } from "@/components/animation";

export function CeoNote() {
  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <FadeUp y={24}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 p-8 md:p-12">
            <div className="flex flex-col gap-6">
              <Quote className="w-8 h-8 text-muted-foreground/40" />
              <blockquote className="font-heading text-2xl md:text-3xl font-normal text-foreground leading-snug tracking-tight">
                {COMPANY.ceo.quote}
              </blockquote>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-heading font-medium text-foreground text-sm">
                  KS
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {COMPANY.ceo.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {COMPANY.ceo.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch lg:items-end justify-between gap-6 lg:max-w-xs">
              <p className="text-sm text-muted-foreground leading-relaxed lg:text-right">
                Working on a hotel, hospital, or central kitchen project? Get a
                consultation — site visit if needed.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/portal/consultations">
                  <IndustrialButton className="w-full gap-2" size="lg">
                    Book a consultation
                    <ArrowRight className="w-4 h-4" />
                  </IndustrialButton>
                </Link>
                <a
                  href={COMPANY.contact.emailMailto}
                  className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  or email {COMPANY.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
