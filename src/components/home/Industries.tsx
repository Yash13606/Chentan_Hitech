import Link from "next/link";
import { Building2, UtensilsCrossed, Stethoscope, Shield, Anchor, Factory } from "lucide-react";

const INDUSTRIES = [
  {
    icon: Building2,
    name: "Hospitality",
    description: "Hotels, resorts, banquets and serviced apartments.",
    slug: "hospitality",
  },
  {
    icon: UtensilsCrossed,
    name: "Restaurant",
    description: "Standalone restaurants, cafés and quick-service.",
    slug: "restaurant",
  },
  {
    icon: Stethoscope,
    name: "Healthcare",
    description: "Hospital kitchens, CSSD and patient-care laundries.",
    slug: "healthcare",
  },
  {
    icon: Shield,
    name: "Defence",
    description: "Army messes, Navy galleys, Air Force station kitchens.",
    slug: "defence",
  },
  {
    icon: Anchor,
    name: "Marine",
    description: "Cruise lines, coast guard and offshore platforms.",
    slug: "marine",
  },
  {
    icon: Factory,
    name: "Industrial Kitchens",
    description: "Bulk cooking, central kitchens, large canteens.",
    slug: "industrial-kitchens",
  },
] as const;

export function Industries() {
  return (
    <section className="bg-foreground text-background py-20 md:py-24">
      <div className="px-6 max-w-6xl mx-auto">
        <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-background/60 mb-3 block">
          Industries we serve
        </span>
        <h2 className="font-heading font-medium tracking-tight text-3xl md:text-4xl text-background leading-tight max-w-3xl">
          A decade of equipping India&apos;s most demanding kitchens.
        </h2>
        <p className="mt-4 text-base md:text-lg text-background/70 leading-relaxed max-w-2xl">
          From 200-cover hotel banquets to Navy galleys at sea, we&apos;ve supplied
          equipment to clients who can&apos;t afford downtime.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.slug}
              href={`/catalog?industry=${ind.slug.toUpperCase().replace(/-/g, "_")}`}
              className="group flex flex-col gap-4 p-6 rounded-xl border border-background/10 hover:border-background/30 hover:bg-background/[0.04] transition-all"
            >
              <ind.icon className="w-6 h-6 text-background/70 group-hover:text-background transition-colors" />
              <div>
                <h3 className="font-heading text-xl font-medium text-background leading-tight">
                  {ind.name}
                </h3>
                <p className="mt-2 text-sm text-background/70 leading-relaxed">
                  {ind.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
