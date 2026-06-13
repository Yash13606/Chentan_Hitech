"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Inquiry {
  id: string;
  inquiryNumber: string;
  status: string;
  leadScore: number | null;
  createdAt: Date;
}

interface PortalClientProps {
  user: {
    name: string | null;
    email: string;
    company?: {
      name: string;
      industry: string | null;
    } | null;
    _count: { inquiries: number };
  } | null;
  recentInquiries: Inquiry[];
  rfq?: string;
}

const STAGGER_CHILD = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function PortalClient({ user, recentInquiries, rfq }: PortalClientProps) {
  const companyName = user?.company?.name || "GUEST ACCOUNT";
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="space-y-16"
      >
        {/* RFQ success banner */}
        {rfq && (
          <motion.div variants={STAGGER_CHILD} className="bg-primary text-primary-foreground px-6 py-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest">
                [ RFQ SUBMITTED ]
              </p>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Reference: <span className="font-mono">{rfq}</span>. Our engineering team will return a formal quotation within 24 hours.
              </p>
            </div>
          </motion.div>
        )}

        {/* Typographic Header */}
        <motion.div variants={STAGGER_CHILD} className="border-b border-border pb-10">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
            PORTAL / {companyName.toUpperCase()}
          </p>
          <h1 className="text-4xl md:text-6xl font-heading font-medium tracking-tight text-foreground">
            Procurement Command
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Review historical quotations, manage active inquiries, and discover phase-balanced industrial equipment.
          </p>
        </motion.div>

        {/* Asymmetrical Action Grid */}
        <motion.div variants={STAGGER_CHILD} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Primary Action (Left - 7 cols) */}
          <Link href="/catalog" className="group lg:col-span-7 relative bg-surface-1 border border-border p-8 md:p-12 overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-700" />
            <div className="relative z-10">
              <h2 className="text-3xl font-heading font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                Start New RFQ
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md">
                Browse our industrial catalog. Add specific equipment to your quotation cart to initiate a formal procurement request.
              </p>
            </div>
            
            <div className="relative z-10 mt-12 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary transition-all duration-300">
                <ArrowUpRight className="w-5 h-5 text-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                ENTER CATALOG
              </span>
            </div>
          </Link>

          {/* Secondary Actions (Right Stack - 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 border-l-0 lg:border-l border-border lg:pl-8">
            {[
              { title: "My Quotations", href: "/portal/quotations", sub: `${user?._count?.inquiries ?? 0} active inquiries` },
              { title: "Consultation", href: "/portal/consultations", sub: "Schedule engineering review" },
              { title: "Saved Bundles", href: "/portal/bundles", sub: "Reusable equipment loadouts" },
              { title: "Company Profile", href: "/portal/profile", sub: "Manage delivery & tax details" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="group block border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-wider text-[10px]">
                  {item.sub}
                </p>
              </Link>
            ))}
          </div>

        </motion.div>

        {/* Industrial Ledger (Recent Inquiries) */}
        <motion.div variants={STAGGER_CHILD} className="pt-10">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-heading font-medium text-foreground">
              The Ledger
            </h2>
            <Link href="/portal/quotations" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              [ VIEW FULL HISTORY ]
            </Link>
          </div>

          <div className="border-t border-border">
            {recentInquiries.length === 0 ? (
              <div className="py-12 text-center border-b border-border">
                <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  [ NO RECORDED INQUIRIES ]
                </p>
                <p className="text-foreground">
                  Your procurement history is empty.{" "}
                  <Link href="/catalog" className="underline hover:text-primary transition-colors">
                    Initiate your first request
                  </Link>.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentInquiries.map((inq) => (
                  <Link 
                    key={inq.id} 
                    href={`/portal/quotations/${inq.id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 hover:bg-surface-1 transition-colors px-4 -mx-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                      <span className="font-mono text-sm tracking-widest text-foreground">
                        {inq.inquiryNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          inq.status === "NEW" ? "bg-blue-500 animate-pulse" :
                          inq.status === "QUOTED" ? "bg-primary" : "bg-muted-foreground"
                        }`} />
                        <span className={`font-mono text-xs uppercase tracking-widest ${
                           inq.status === "QUOTED" ? "text-primary" : "text-muted-foreground"
                        }`}>
                          [ {inq.status.replace(/_/g, " ")} ]
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-8">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-transparent group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
