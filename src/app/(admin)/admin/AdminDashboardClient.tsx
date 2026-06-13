"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, FileUp, List, Users, Package, RefreshCw } from "lucide-react";

interface InquiryData {
  id: string;
  inquiryNumber: string;
  status: string;
  leadScore: string;
  createdAt: Date;
  customer: { name: string | null; email: string };
  company: { name: string };
}

interface ImportRunData {
  id: string;
  status: string;
  totalRows: number;
  okRows: number;
  failedRows: number;
  createdAt: Date;
}

interface AdminDashboardClientProps {
  stats: {
    products: number;
    categories: number;
    inquiries: number;
    users: number;
  };
  recentInquiries: InquiryData[];
  importRuns: ImportRunData[];
}

const STAGGER_CHILD: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function AdminDashboardClient({ stats, recentInquiries, importRuns }: AdminDashboardClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Brutalist Header */}
      <div className="border-b border-border bg-surface-1 px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest border border-border px-2 py-0.5">
                [ ENV: PROD ]
              </span>
              <span className="text-[10px] font-mono font-medium text-primary uppercase tracking-widest border border-border px-2 py-0.5">
                [ SYSTEM: ONLINE ]
              </span>
            </div>
            <h1 className="font-heading font-medium text-4xl md:text-5xl text-foreground tracking-tight">
              Admin Command
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-widest"
          >
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5">Products</Link>
            <Link href="/admin/quotations" className="text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5">Quotations</Link>
            <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5">Inquiries</Link>
            <Link href="/admin/products/import" className="text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5">Import</Link>
            <Link href="/crm" className="text-primary hover:text-primary/80 transition-colors border-b border-transparent hover:border-primary pb-0.5">CRM</Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5 ml-4">Exit</Link>
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-6 py-12"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {/* Asymmetrical Stats Grid */}
        <motion.div variants={STAGGER_CHILD} className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-border mb-12">
          {[
            { label: "Active Products", value: stats.products, icon: Package },
            { label: "Categories", value: stats.categories, icon: List },
            { label: "Total Inquiries", value: stats.inquiries, icon: ArrowUpRight },
            { label: "Registered Users", value: stats.users, icon: Users },
          ].map((stat, i) => (
            <div 
              key={stat.label} 
              className={`group p-6 md:p-8 bg-background hover:bg-foreground hover:text-background transition-colors duration-300 flex flex-col justify-between min-h-[160px]
                ${i !== 0 && i !== 2 ? "border-l border-border" : ""}
                ${i < 2 ? "border-b lg:border-b-0 lg:border-border" : ""}
                ${i === 1 ? "lg:border-l border-border" : ""}
              `}
            >
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-mono font-medium text-muted-foreground group-hover:text-background/70 uppercase tracking-widest">
                  [ {stat.label} ]
                </p>
                <stat.icon className="w-4 h-4 text-muted-foreground group-hover:text-background/70" />
              </div>
              <p className="font-heading font-medium text-4xl md:text-5xl text-foreground group-hover:text-background tracking-tighter mt-4">
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Ledger (Left - 8 cols) */}
          <motion.div variants={STAGGER_CHILD} className="lg:col-span-8">
            <div className="flex items-end justify-between mb-6 border-b border-border pb-4">
              <h2 className="font-heading font-medium text-2xl text-foreground">The Ledger</h2>
              <Link href="/admin/inquiries" className="text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="border border-border bg-background">
              {recentInquiries.length === 0 ? (
                <div className="p-12 text-center text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  [ NO INQUIRIES LOGGED ]
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentInquiries.map((inq) => (
                    <Link 
                      key={inq.id} 
                      href={`/admin/inquiries/${inq.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 hover:bg-surface-1 transition-colors"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm tracking-widest text-foreground">
                            {inq.inquiryNumber}
                          </span>
                          <span className={`font-mono text-[10px] uppercase tracking-widest ${
                            inq.leadScore === "HIGH" ? "text-red-500" :
                            inq.leadScore === "MEDIUM" ? "text-yellow-500" :
                            "text-muted-foreground"
                          }`}>
                            [ {inq.leadScore} PRIORITY ]
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{inq.company.name}</span>
                      </div>

                      <div className="mt-4 sm:mt-0 flex items-center gap-6 sm:gap-12 text-right">
                        <span className={`font-mono text-[10px] uppercase tracking-widest ${
                           inq.status === "NEW" ? "text-primary animate-pulse" : 
                           "text-muted-foreground"
                        }`}>
                          [ {inq.status.replace(/_/g, " ")} ]
                        </span>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Side Panel (Right - 4 cols) */}
          <motion.div variants={STAGGER_CHILD} className="lg:col-span-4 space-y-12">
            
            {/* Quick Actions */}
            <div>
              <h2 className="font-heading font-medium text-lg text-foreground mb-4 border-b border-border pb-4">Command Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-0 border border-border">
                {[
                  { href: "/admin/products/new", label: "NEW PRODUCT", icon: Package },
                  { href: "/admin/products/import", label: "BULK IMPORT", icon: FileUp },
                  { href: "/crm", label: "CRM WORKSPACE", icon: Users },
                ].map((action, i) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group flex items-center justify-between p-5 bg-background hover:bg-primary transition-colors duration-300
                      ${i !== 0 ? "border-t border-border" : ""}
                    `}
                  >
                    <span className="font-mono text-xs text-foreground group-hover:text-primary-foreground tracking-widest">
                      {action.label}
                    </span>
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Import Runs */}
            {importRuns.length > 0 && (
              <div>
                <h2 className="font-heading font-medium text-lg text-foreground mb-4 border-b border-border pb-4">Import Log</h2>
                <div className="border border-border divide-y divide-border bg-background">
                  {importRuns.map((run) => (
                    <div key={run.id} className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[10px] uppercase tracking-widest ${
                          run.status === "COMPLETED" ? "text-green-500" :
                          run.status === "FAILED" ? "text-red-500" : "text-yellow-500"
                        }`}>
                          [ {run.status} ]
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(run.createdAt).toLocaleDateString("en-US", { month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-foreground">
                        {run.totalRows} T / {run.okRows} OK / {run.failedRows} ERR
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
