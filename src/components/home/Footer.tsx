import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { COMPANY } from "@/lib/company";

const NAV_GROUPS = [
  {
    title: "Catalog",
    links: [
      { href: "/catalog", label: "All products" },
      { href: "/catalog?category=cooking-equipment", label: "Cooking" },
      { href: "/catalog?category=refrigeration", label: "Refrigeration" },
      { href: "/catalog?category=laundry-equipment", label: "Laundry" },
      { href: "/catalog?category=dishwashing", label: "Dishwashing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/brands", label: "Brand partners" },
      { href: "/knowledge", label: "Knowledge center" },
      { href: "/portal/consultations", label: "Consultations" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/signup", label: "Create account" },
      { href: "/portal", label: "Customer portal" },
      { href: "/cart", label: "RFQ cart" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Brand + contact */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm bg-background flex items-center justify-center">
                <span className="font-heading font-medium text-foreground text-[13px] leading-none">
                  C
                </span>
              </div>
              <span className="font-heading font-medium text-base text-background">
                {COMPANY.shortName}
              </span>
            </div>

            <p className="text-sm text-background/70 leading-relaxed max-w-sm">
              {COMPANY.description}
            </p>

            <div className="space-y-2 text-sm text-background/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-1 shrink-0" />
                <div className="leading-relaxed">
                  {COMPANY.contact.addressLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                  <a
                    href={COMPANY.contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-xs underline decoration-background/30 hover:decoration-background underline-offset-4"
                  >
                    Get directions
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={COMPANY.contact.phoneCallable}
                  className="hover:text-background transition-colors font-mono text-[13px]"
                >
                  {COMPANY.contact.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={COMPANY.contact.emailMailto}
                  className="hover:text-background transition-colors"
                >
                  {COMPANY.contact.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{COMPANY.contact.hours}</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-medium tracking-[0.18em] uppercase text-background/50 mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/70 hover:text-background transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal strip */}
        <div className="border-t border-background/10 mt-14 pt-8 flex flex-col md:flex-row justify-between gap-4 text-[11px] font-mono tracking-tight text-background/50">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>GSTIN {COMPANY.legal.gstin}</span>
            <span>IEC {COMPANY.legal.iec}</span>
            <span>Estd. {COMPANY.founded}</span>
            <span>{COMPANY.legal.status}</span>
          </div>
          <div>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
