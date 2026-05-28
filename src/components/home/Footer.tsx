import Link from "next/link";
import { COMPANY } from "@/lib/company";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { href: "/catalog", label: "Equipment Catalog" },
      { href: "/cart", label: "Quotation Builder" },
      { href: "/portal/bundles", label: "Saved Bundles" },
      { href: "/crm", label: "Lead Dashboard" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { href: "/catalog?industry=HOSPITALITY", label: "Hospitality" },
      { href: "/catalog?industry=HEALTHCARE", label: "Healthcare" },
      { href: "/catalog?industry=DEFENCE", label: "Defence & Marine" },
      { href: "/catalog?industry=CORPORATE", label: "Corporate" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/portal", label: "Dashboard" },
      { href: "/portal/quotations", label: "My Quotations" },
      { href: "/portal/consultations", label: "Consultations" },
      { href: "/knowledge", label: "Knowledge Center" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative bg-foreground text-background overflow-hidden">
      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-[38%] translate-y-[18%]"
      >
        <span
          className="font-heading font-medium leading-none whitespace-nowrap text-background"
          style={{ fontSize: "clamp(80px, 18vw, 260px)", opacity: 0.04, letterSpacing: "-0.04em" }}
        >
          HITECH
        </span>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* ── Main grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-20 pt-14 pb-12 border-b border-background/10">

          {/* Brand column */}
          <div className="lg:max-w-[260px]">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-7 h-7 rounded-sm bg-primary grid place-items-center shrink-0">
                <span className="font-heading font-medium text-background text-[13px] leading-none">
                  C
                </span>
              </div>
              <span className="font-heading font-medium text-base tracking-tight text-background">
                {COMPANY.shortName}
              </span>
            </Link>
            <p className="text-[13px] text-background/45 leading-relaxed">
              An industrial procurement and digital quotation platform engineered for enterprise-scale facility setups and complex B2B infrastructure deployments.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10 lg:justify-end">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-background/40 mb-4">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-background/65 hover:text-background transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────── */}
        <div className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[11px] font-mono tracking-[0.12em] uppercase text-background/35">
            © {new Date().getFullYear()} {COMPANY.name.toUpperCase()}. All rights reserved.
          </span>

          {/* Pill indicator */}
          <div
            aria-hidden
            className="hidden sm:flex justify-center"
          >
            <div className="w-10 h-1.5 rounded-full bg-background/20" />
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-[11px] font-mono tracking-[0.1em] uppercase text-background/35 hover:text-background/60 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] font-mono tracking-[0.1em] uppercase text-background/35 hover:text-background/60 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
