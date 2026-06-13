"use client";

import { COMPANY } from "@/lib/company";
import { StaggerGrid, StaggerItem } from "@/components/animation";

export function TrustStrip() {
  const stats = [
    {
      value: `${COMPANY.trust.yearsInBusiness}+`,
      label: "Years in business",
    },
    {
      value: `${COMPANY.trust.partnerBrandCount}+`,
      label: "Brands distributed",
    },
    {
      value: `${COMPANY.trust.rating} / 5`,
      label: `${COMPANY.trust.reviewCount} verified reviews`,
    },
    {
      value: "GSTIN",
      label: `Verified ${COMPANY.legal.gstin}`,
    },
  ];

  return (
    <div className="w-full border-y border-border bg-background relative z-10">
      <div className="max-w-6xl mx-auto bg-border overflow-hidden">
        <StaggerGrid
          className="grid grid-cols-2 lg:grid-cols-4 gap-px"
          stagger={0.08}
          delay={0.1}
        >
          {stats.map((stat, i) => (
            <StaggerItem key={i} className="bg-background h-full">
              <div className="group flex flex-col justify-center px-6 sm:px-8 py-10 md:py-14 h-full hover:bg-muted/30 transition-colors duration-500 cursor-default">
                <span className="font-heading font-medium text-[2.5rem] md:text-5xl lg:text-6xl tracking-tight text-foreground mb-3 leading-none transition-transform duration-500 group-hover:-translate-y-1">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground leading-relaxed">
                  {stat.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </div>
  );
}
