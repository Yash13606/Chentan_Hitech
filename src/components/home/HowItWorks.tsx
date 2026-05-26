import { Search, ShoppingCart, FileText } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Browse and shortlist",
    description:
      "Filter the catalog by category, brand or industry. Compare specs side by side. Save bundles for projects in planning.",
  },
  {
    n: "02",
    icon: ShoppingCart,
    title: "Build your RFQ",
    description:
      "Add equipment to a cart, set quantities and project notes. Submit a single quotation request — no phone tag required.",
  },
  {
    n: "03",
    icon: FileText,
    title: "Receive a branded PDF",
    description:
      "Sales reviews your inquiry, configures pricing, and sends a branded PDF quotation with valid-until dates and terms.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="How it works"
        title="From shortlist to quotation in three steps"
        sub="No payment gateway, no hidden pricing tricks — just a clean RFQ flow that replaces phone calls and email chains."
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="relative rounded-xl border border-border bg-card p-7 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <step.icon className="w-6 h-6 text-foreground" />
              <span className="font-mono text-[11px] tracking-tight text-muted-foreground/60">
                {step.n}
              </span>
            </div>
            <h3 className="font-heading text-xl font-medium text-foreground leading-snug">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
