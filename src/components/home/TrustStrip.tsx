import { COMPANY } from "@/lib/company";
import { Award, Globe2, ShieldCheck, Star } from "lucide-react";

/**
 * Trust strip — a single hairline-bordered row of company facts.
 * The kind of bar that sits between hero and content, doing quiet work.
 */
export function TrustStrip() {
  const items = [
    {
      icon: Award,
      label: `${COMPANY.trust.yearsInBusiness}+ years`,
      sub: "in business",
    },
    {
      icon: Globe2,
      label: `${COMPANY.trust.partnerBrandCount}+ brands`,
      sub: "distributed",
    },
    {
      icon: Star,
      label: `${COMPANY.trust.rating} / 5`,
      sub: `${COMPANY.trust.reviewCount} reviews`,
    },
    {
      icon: ShieldCheck,
      label: "GSTIN verified",
      sub: COMPANY.legal.gstin,
    },
  ] as const;

  return (
    <div className="border-y border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono tracking-tight">
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
