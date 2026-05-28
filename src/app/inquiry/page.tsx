import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { COMPANY } from "@/lib/company";
import { Nav } from "@/components/home/Nav";
import { Footer } from "@/components/home/Footer";

import { InquiryForm } from "./InquiryForm";

export const metadata: Metadata = {
  title: "Send an inquiry — Chetan Hi-Tech",
  description:
    "Tell us what equipment you're sourcing. Our team replies within 10 minutes during business hours — no commitment required.",
};

// Pre-fill from session if user is logged in (UX rule #4: refill what you can)
async function getPrefill() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      company: { select: { name: true } },
    },
  });

  if (!user) return null;
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    company: user.company?.name ?? "",
  };
}

export default async function InquiryPage() {
  const prefill = await getPrefill();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-20 items-start">
            {/* ── Left column: pitch ─────────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-muted-foreground mb-4">
                Contact · Inquiry
              </p>
              <h1 className="font-heading font-medium text-4xl md:text-5xl tracking-tight leading-[1.05]">
                Send an inquiry
              </h1>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-md">
                Tell us what you want to build. We&rsquo;ll reply within{" "}
                <span className="text-foreground font-medium">10 minutes</span>{" "}
                during business hours.
              </p>

              {/* Schedule a call card */}
              <div className="mt-8 border border-border bg-card rounded-md p-5 max-w-md">
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-medium">Get a scope</span> &mdash; free
                  10&#8209;min call to align on your project. No commitment.
                </p>
                <Link
                  href="/portal/consultations"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group"
                >
                  Schedule a call
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <p className="mt-8 text-sm text-muted-foreground italic max-w-md">
                Move fast. We don&rsquo;t do slow.
              </p>

              {/* Contact strip */}
              <div className="mt-12 border-t border-border pt-8 space-y-3 max-w-md">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <a
                    href={COMPANY.contact.phoneCallable}
                    className="font-mono hover:text-foreground transition-colors"
                  >
                    {COMPANY.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <a
                    href={COMPANY.contact.emailMailto}
                    className="hover:text-foreground transition-colors"
                  >
                    {COMPANY.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{COMPANY.contact.hours}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {COMPANY.contact.addressShort}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right column: form ─────────────────────────────── */}
            <div>
              <InquiryForm prefill={prefill} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
