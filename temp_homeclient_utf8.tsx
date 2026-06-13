"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Building2,
  Anchor,
  Shield,
  FileText,
  Search,
  ShoppingCart,
  Menu,
  X,
  CheckCircle2,
  Zap,
  Globe2,
  Award,
  ArrowUpRight,
  BookOpen,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

type FeaturedProduct = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string | null;
  availability: "IN_STOCK" | "MADE_TO_ORDER" | "DISCONTINUED";
  specs: unknown;
  images: string[];
  category: { name: string };
};

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  industry: string | null;
  tags: string[];
  publishedAt: Date | null;
  readTime?: string;
};

interface HomeClientProps {
  featuredProducts: FeaturedProduct[];
  articles: Article[];
}

const BUNDLE_ITEMS = [
  { name: "Commercial Convection Oven", specs: "220V, Stainless Steel", qty: 2, price: "Γé╣4,50,000" },
  { name: "Walk-in Cooler Unit", specs: "8x10ft, Custom Shelving", qty: 1, price: "Configuring..." },
  { name: "Industrial Dishwasher", specs: "Under-counter, High Temp", qty: 3, price: "Γé╣2,10,000" },
];

export function HomeClient({ featuredProducts, articles }: HomeClientProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiInput }),
      });
      if (!res.ok) throw new Error("AI error");
      const data = await res.json() as { suggestion: string };
      setAiResult(data.suggestion);
    } catch {
      setAiResult("Unable to generate suggestions right now. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border z-50 flex items-center px-6">
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-sm" />
            <span className="font-heading font-medium tracking-tight text-lg">Chetan Hi-Tech</span>
          </Link>
          <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <Link href="/catalog" className="hover:text-foreground transition-colors">Equipment Catalog</Link>
            <Link href="/knowledge" className="hover:text-foreground transition-colors">Knowledge Center</Link>
            <Link href="/portal/consultations" className="hover:text-foreground transition-colors">Consultations</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/portal" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/cart">
                <IndustrialButton size="sm" className="hidden md:flex gap-2">
                  <ShoppingCart className="w-4 h-4" /> My Cart
                </IndustrialButton>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <IndustrialButton variant="tertiary" className="hidden md:flex">Login</IndustrialButton>
              </Link>
              <Link href="/cart">
                <IndustrialButton className="gap-2">
                  <ShoppingCart className="w-4 h-4" /> Request Quote
                </IndustrialButton>
              </Link>
            </>
          )}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 px-6 flex flex-col gap-4 lg:hidden">
          <Link href="/catalog" className="py-3 border-b border-border text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Equipment Catalog</Link>
          <Link href="/knowledge" className="py-3 border-b border-border text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Knowledge Center</Link>
          <Link href="/portal/consultations" className="py-3 border-b border-border text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Consultations</Link>
          {isLoggedIn ? (
            <>
              <Link href="/portal" className="py-3 border-b border-border text-sm font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
              <Link href="/cart" className="py-3 border-b border-border text-sm font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><ShoppingCart className="w-4 h-4" /> My Cart</Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="py-3 text-sm font-medium flex items-center gap-2 text-muted-foreground"><LogOut className="w-4 h-4" /> Sign Out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="py-3 border-b border-border text-sm font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><User className="w-4 h-4" /> Login</Link>
              <Link href="/signup" className="py-3 border-b border-border text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </div>
      )}

      <main className="pt-32 pb-0">
        {/* 1. Hero */}
        <section className="px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-[clamp(40px,8vw,80px)] leading-[1.10] font-heading font-medium text-foreground max-w-4xl"
          >
            Equip your facility. <br className="hidden md:block" />
            <span className="text-muted-foreground">Scale with precision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            The B2B procurement engine for hospitality, healthcare, defence, and corporate infrastructure. Build carts, negotiate, and deploy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/catalog">
              <IndustrialButton size="lg" className="w-full sm:w-auto gap-2">
                Explore Catalog <ArrowRight size={16} />
              </IndustrialButton>
            </Link>
            <a href="#ai-assistant">
              <IndustrialButton variant="secondary" size="lg" className="w-full sm:w-auto">
                AI Requirement Assistant
              </IndustrialButton>
            </a>
          </motion.div>
        </section>

        {/* Product UI Mockup */}
        <section className="mt-24 px-4 md:px-12 max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-[24px] border border-border shadow-[rgba(0,0,0,0.05)_0px_10px_40px] overflow-hidden relative"
          >
            <div className="h-12 border-b border-border flex items-center px-4 bg-background">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <div className="mx-auto bg-card border border-border rounded-md px-16 sm:px-32 py-1.5 flex items-center gap-2 text-xs text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                <Search className="w-3 h-3" /> search products or SKU...
              </div>
            </div>

            <div className="flex flex-col md:flex-row h-auto md:h-[600px] bg-card">
              <div className="hidden md:flex flex-col w-64 border-r border-border bg-background p-4">
                <div className="text-xs font-medium tracking-[0.4px] text-muted-foreground mb-4 uppercase font-sans">
                  Project Workspace
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-2 text-sm rounded-md bg-secondary text-foreground font-medium">
                    <FileText className="w-4 h-4 text-primary" /> Active Quotation
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary cursor-pointer transition-colors">
                    <Package className="w-4 h-4" /> Saved Bundles
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-heading font-medium tracking-normal text-foreground">Mumbai Navy Mess Setup</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inquiry ID: <span className="font-mono text-foreground tracking-[-0.32px]">#CH-8832-NVY</span> &middot; Priority:{" "}
                      <span className="text-[#b53333] font-medium bg-[#b53333]/10 px-2 py-0.5 rounded">High</span>
                    </p>
                  </div>
                  <Link href={isLoggedIn ? "/cart" : "/signup"}>
                    <IndustrialButton variant="secondary" className="gap-2 shrink-0">
                      <ShoppingCart size={14} /> {isLoggedIn ? "My Cart" : "Get Started"}
                    </IndustrialButton>
                  </Link>
                </div>

                <div className="border border-border rounded-lg overflow-x-auto bg-background">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground bg-muted uppercase tracking-[0.4px]">
                        <th className="px-6 py-4 font-medium">Product / Spec</th>
                        <th className="px-6 py-4 font-medium w-24 text-center">Qty</th>
                        <th className="px-6 py-4 font-medium w-32 text-right">Est. Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-border">
                      {BUNDLE_ITEMS.map((item, i) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{item.specs}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="bg-card border border-border rounded px-2 py-1.5 w-16 mx-auto text-center font-mono text-[13px] text-foreground">
                              {item.qty}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-[13px] text-muted-foreground text-right tracking-[-0.32px]">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div className="bg-background border border-border rounded-xl p-5 max-w-lg text-sm text-muted-foreground shadow-[rgba(0,0,0,0.02)_0px_4px_12px]">
                    <strong className="text-foreground block mb-2 font-heading text-base font-medium">Engineering Recommendation</strong>
                    <p className="leading-relaxed">
                      For a mess facility serving 500+ personnel, we recommend adding the{" "}
                      <span className="text-foreground font-medium border-b border-dashed border-border cursor-help">Heavy Duty Waste Disposer (1.5 HP)</span>{" "}
                      to handle the organic load efficiently. Shall I add this to the cart?
                    </p>
                    <div className="mt-5 flex gap-3">
                      <Link href={isLoggedIn ? "/cart" : "/signup"}>
                        <IndustrialButton size="sm">Add to Cart</IndustrialButton>
                      </Link>
                      <IndustrialButton variant="secondary" size="sm">Dismiss</IndustrialButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. Social Proof */}
        <section className="py-16 mt-12 border-y border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="font-sans text-sm font-medium uppercase tracking-[0.4px] text-muted-foreground mb-8">
              Trusted by 200+ facilities across India
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="font-heading font-medium text-2xl">TAJ HOTELS</div>
              <div className="font-heading font-medium text-2xl">APOLLO HOSPITALS</div>
              <div className="font-heading font-medium text-2xl">INDIAN NAVY</div>
              <div className="font-heading font-medium text-2xl">INFOSYS CAMPUS</div>
            </div>
          </div>
        </section>

        {/* 3. Process */}
        <section className="border-y border-border bg-background px-6 py-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-10">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-xs font-sans font-medium tracking-[0.4px] text-muted-foreground uppercase shrink-0">Process</span>
                <h2 className="text-2xl font-heading font-medium text-foreground">
                  Procurement, <span className="text-muted-foreground italic font-normal">simplified.</span>
                </h2>
              </div>
              <p className="text-sm text-muted-foreground shrink-0">Three steps. Brief to deployed facility.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {[
                {
                  step: "01",
                  title: "Select Domain",
                  desc: "Browse by industry or describe your facility. We map your requirements to the right equipment categories.",
                  href: "/catalog",
                },
                {
                  step: "02",
                  title: "Build Quotation",
                  desc: "Add equipment, set quantities, attach notes per item. Submit a structured RFQ, not a blank contact form.",
                  href: "/cart",
                },
                {
                  step: "03",
                  title: "Receive the Offer",
                  desc: "Official quotation PDF with pricing, timeline, and installation scope in your portal within 24 hours.",
                  href: isLoggedIn ? "/portal/quotations" : "/signup",
                },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="py-6 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0 group">
                  <span className="font-mono text-xs text-muted-foreground">{item.step}</span>
                  <h3 className="font-heading text-xl font-medium text-foreground mt-2 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Featured Products */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-normal text-foreground">Equipment Spotlight</h2>
              <p className="text-muted-foreground mt-2 text-lg">High-performance infrastructure for demanding environments.</p>
            </div>
            <Link href="/catalog">
              <IndustrialButton variant="tertiary" className="gap-2 shrink-0 border border-border">
                View Catalog <ArrowRight size={16} />
              </IndustrialButton>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 3).map((product) => (
                <IndustrialProductCard
                  key={product.id}
                  title={product.title}
                  category={product.category.name}
                  availability={product.availability === "IN_STOCK" ? "in-stock" : "made-to-order"}
                  specs={Array.isArray(product.specs) ? (product.specs as { label: string; value: string }[]) : []}
                  slug={product.slug}
                  sku={product.sku}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <IndustrialProductCard title="Continuous Flight Dishwasher" category="Warewashing" availability="in-stock" specs={[{ label: "Output", value: "3000 plates/h" }, { label: "Power", value: "3-Phase 400V" }]} />
              <IndustrialProductCard title="Barrier Washer Extractor" category="Laundry Infrastructure" availability="made-to-order" specs={[{ label: "Capacity", value: "50 kg/cycle" }, { label: "G-Force", value: "350G" }]} />
              <IndustrialProductCard title="Combi Oven 20-Grid" category="Kitchen Equipment" availability="low-stock" specs={[{ label: "Capacity", value: "20x 1/1 GN" }, { label: "Injection", value: "Direct Steam" }]} />
            </div>
          )}
        </section>

        {/* 5. Solution Bundles */}
        <section className="py-20 px-6 bg-muted/20 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold tracking-[0.15em] text-muted-foreground uppercase mb-3">DOMAINS</p>
              <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-tight text-foreground">Solution Bundles by Industry</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link href="/catalog?industry=HOSPITALITY" className="md:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col hover:border-primary/40 transition-colors group">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Hospitality</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-background" />
                  </div>
                  <h3 className="text-xl font-heading font-medium group-hover:text-primary transition-colors">Hotel Kitchen Setup</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  A comprehensive cooking, prep, and warewashing line designed for 5-star operations serving 1000+ covers daily.
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Modular cooking islands with integrated induction</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Walk-in blast chillers and multi-zone cold storage</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Automated rack-conveyor dishwashing systems</li>
                </ul>
              </Link>

              <Link href="/catalog?industry=HEALTHCARE" className="md:col-span-1 bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col hover:border-primary/40 transition-colors group">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Healthcare</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-background" />
                  </div>
                  <h3 className="text-xl font-heading font-medium group-hover:text-primary transition-colors">Hospital Laundry</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">Infection-control compliant barrier washing and finishing equipment.</p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Pass-through barrier washers</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Thermal disinfection cycles</li>
                </ul>
              </Link>

              <Link href="/catalog?industry=DEFENCE" className="md:col-span-1 bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col hover:border-primary/40 transition-colors group">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Defence & Marine</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                    <Anchor size={20} className="text-background" />
                  </div>
                  <h3 className="text-xl font-heading font-medium group-hover:text-primary transition-colors">Naval Mess</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">Heavy-duty, marine-grade infrastructure for high vibration environments.</p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> 316-grade stainless steel throughout</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Anti-spill marine mounting</li>
                </ul>
              </Link>

              <Link href="/catalog?industry=CORPORATE" className="md:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col hover:border-primary/40 transition-colors group">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Industrial Canteens</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-background" />
                  </div>
                  <h3 className="text-xl font-heading font-medium group-hover:text-primary transition-colors">Corporate Cafeteria</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  High-throughput servery counters, bulk cooking kettles, and rapid dishwashing systems for tech parks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> 500-Liter tilting boiling pans</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Continuous flight dishwashers</li>
                  </ul>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Heated / Chilled drop-in displays</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">ΓÇó</span> Touchless cutlery dispensers</li>
                  </ul>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. AI Requirement Assistant */}
        <section id="ai-assistant" className="py-32 px-6 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border mb-8 shadow-sm">
              <Zap size={24} className="text-primary" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-foreground mb-6">
              Not sure what you need?
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
              Tell our engineering AI about your facility, and we'll instantly suggest a compliant, phase-balanced equipment list.
            </p>

            <form onSubmit={handleAiSubmit} className="relative max-w-3xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex flex-col md:flex-row items-center bg-muted/30 border border-border rounded-2xl p-2 shadow-xl">
                <div className="flex-1 w-full flex items-center px-4 py-3 md:py-0">
                  <div className={`w-2 h-2 rounded-full mr-4 shrink-0 ${aiLoading ? "animate-ping bg-primary" : "animate-pulse bg-primary"}`} />
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="e.g. 500-bed hospital kitchen serving 3 meals a day..."
                    className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 text-base md:text-lg cursor-text"
                  />
                </div>
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="w-full md:w-auto mt-2 md:mt-0 whitespace-nowrap inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-sans text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-60"
                >
                  {aiLoading ? "Generating..." : <><span>Generate Loadout</span> <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>

            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 text-left"
              >
                <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">AI Recommendation</p>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{aiResult}</div>
                <div className="mt-4 flex gap-3">
                  <Link href="/catalog">
                    <IndustrialButton size="sm">Browse Catalog</IndustrialButton>
                  </Link>
                  <Link href={isLoggedIn ? "/portal/consultations" : "/signup"}>
                    <IndustrialButton variant="secondary" size="sm">Book Consultation</IndustrialButton>
                  </Link>
                </div>
              </motion.div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Instant Calculation</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Global Standards</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Export to RFQ</span>
            </div>
          </div>
        </section>

        {/* 7. Why CHT */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto bg-foreground text-background rounded-[24px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden border border-border">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent opacity-60" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 relative z-10 items-center">
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="mb-10">
                  <p className="text-[10px] font-sans font-bold tracking-[0.15em] text-primary uppercase mb-4">Why Chetan Hi-Tech</p>
                  <h2 className="text-3xl md:text-5xl font-heading font-medium tracking-tight leading-[1.1] mb-6">
                    We don&apos;t just supply equipment.<br />
                    <span className="text-background/50 italic font-normal">We engineer environments.</span>
                  </h2>
                  <p className="text-background/60 text-base md:text-lg leading-relaxed max-w-lg">
                    With over two decades of infrastructure deployment, we bring unmatched operational expertise.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8">
                  {[
                    { icon: Globe2, label: "Pan-India Reach" },
                    { icon: CheckCircle2, label: "End-to-End Execution" },
                    { icon: Award, label: "Tier 1 Partnerships" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-background/10 border border-background/20 flex items-center justify-center shrink-0">
                        <feature.icon size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium tracking-[0.2px]">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-background/10 border border-background/10 rounded-2xl overflow-hidden shadow-inner mt-8 lg:mt-0">
                {[
                  { value: "25+", label: "Years Exp" },
                  { value: "500+", label: "Projects" },
                  { value: "ISO", label: "Certified" },
                  { value: "24/7", label: "Support" },
                ].map((m, i) => (
                  <div key={i} className="bg-background/5 p-6 md:p-8 flex flex-col justify-center hover:bg-background/10 transition-colors group">
                    <div className="text-4xl md:text-5xl font-heading font-light text-background mb-2 group-hover:scale-105 transition-transform origin-left duration-300">
                      {m.value.replace(/\+/, "")}<span className="text-primary font-medium">{m.value.includes("+") ? "+" : ""}</span>
                    </div>
                    <div className="text-[10px] font-mono text-background/40 uppercase tracking-[0.2em]">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Knowledge Center Preview */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-normal text-foreground">Engineering Insights</h2>
              <p className="text-muted-foreground mt-2 text-lg">Case studies, compliance updates, and operational strategies.</p>
            </div>
            <Link href="/knowledge">
              <IndustrialButton variant="tertiary" className="gap-2 shrink-0 border border-border">
                View All Articles <ArrowRight size={16} />
              </IndustrialButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.length > 0
              ? articles.slice(0, 3).map((article) => (
                  <Link key={article.id} href={`/knowledge/${article.slug}`} className="group cursor-pointer">
                    <div className="aspect-[16/10] bg-muted rounded-lg border border-border mb-4 overflow-hidden flex items-center justify-center">
                      <BookOpen size={32} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono px-2 py-1 bg-muted rounded text-muted-foreground">
                        {article.industry ?? "General"}
                      </span>
                      <span className="text-xs text-muted-foreground">{article.readTime ?? "5 min read"}</span>
                    </div>
                    <h4 className="font-heading text-xl font-medium group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                      {article.title}
                      <ArrowUpRight size={18} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    {article.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    )}
                  </Link>
                ))
              : [
                  { tag: "Case Study", title: "Scaling Laundry Operations for 500-Bed Hospitals", time: "5 min read" },
                  { tag: "Compliance", title: "Naval Mess Hygiene Standards Update 2026", time: "8 min read" },
                  { tag: "Engineering", title: "Calculating HVAC Loads for Commercial Kitchens", time: "12 min read" },
                ].map((article, i) => (
                  <Link key={i} href="/knowledge" className="group cursor-pointer">
                    <div className="aspect-[16/10] bg-muted rounded-lg border border-border mb-4 overflow-hidden flex items-center justify-center">
                      <BookOpen size={32} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono px-2 py-1 bg-muted rounded text-muted-foreground">{article.tag}</span>
                      <span className="text-xs text-muted-foreground">{article.time}</span>
                    </div>
                    <h4 className="font-heading text-xl font-medium group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                      {article.title}
                      <ArrowUpRight size={18} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                  </Link>
                ))}
          </div>
        </section>

        {/* 9. Consultation CTA */}
        <section className="py-32 px-6 relative overflow-hidden bg-foreground text-background border-t border-border">
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
          />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-[clamp(48px,6vw,96px)] leading-[0.95] font-heading font-medium tracking-tight mb-8">
                  <span className="block text-background/50 italic font-normal text-3xl md:text-4xl mb-4">The next step.</span>
                  Planning a <br />
                  <span className="text-primary italic">facility</span> setup?
                </h2>
              </motion.div>
            </div>

            <div className="md:col-span-5 flex flex-col items-start md:pl-12 md:border-l border-background/10">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-background/60 leading-relaxed mb-10"
              >
                Don&apos;t leave enterprise infrastructure to guesswork. Book a free site consultation with our engineering team today.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col w-full gap-4"
              >
                <Link href={isLoggedIn ? "/portal/consultations" : "/signup"} className="group relative w-full inline-flex h-16 items-center justify-between rounded-full bg-primary px-8 font-sans text-lg font-medium text-primary-foreground overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <span className="relative z-10">Book Free Consultation</span>
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm group-hover:bg-background/30 transition-colors">
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute inset-0 z-0 bg-[#b53333] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full" />
                </Link>

                <Link href="/portal/consultations" className="group w-full inline-flex h-16 items-center justify-center rounded-full border border-background/10 bg-transparent px-8 font-sans text-lg font-medium text-background transition-colors hover:bg-background/10 active:scale-[0.98]">
                  Contact Sales
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background pt-10 pb-0 overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-full flex justify-center opacity-[0.03] select-none pointer-events-none translate-y-[25%] z-0">
          <span className="text-[18vw] leading-none font-heading font-medium tracking-tighter whitespace-nowrap">CHETAN HI-TECH</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            <div className="md:col-span-5 pr-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-primary rounded-sm" />
                <span className="font-heading font-medium tracking-tight text-lg">Chetan Hi-Tech</span>
              </div>
              <p className="text-[13px] text-background/50 max-w-sm leading-relaxed mb-4">
                An industrial procurement and digital quotation platform engineered for enterprise-scale facility setups and complex B2B infrastructure deployments.
              </p>
            </div>

            <div className="md:col-span-2">
              <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-background/40 mb-4">Platform</h5>
              <ul className="space-y-2 text-[13px] font-sans">
                {[
                  { href: "/catalog", label: "Equipment Catalog" },
                  { href: "/cart", label: "Quotation Builder" },
                  { href: "/portal/bundles", label: "Saved Bundles" },
                  { href: "/crm", label: "Lead Dashboard" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group flex items-center gap-2 text-background opacity-70 hover:opacity-100 transition-opacity">
                      <span className="w-0 h-px bg-primary transition-all group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-background/40 mb-4">Industries</h5>
              <ul className="space-y-2 text-[13px] font-sans">
                {[
                  { href: "/catalog?industry=HOSPITALITY", label: "Hospitality" },
                  { href: "/catalog?industry=HEALTHCARE", label: "Healthcare" },
                  { href: "/catalog?industry=DEFENCE", label: "Defence & Marine" },
                  { href: "/catalog?industry=CORPORATE", label: "Corporate" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group flex items-center gap-2 text-background opacity-70 hover:opacity-100 transition-opacity">
                      <span className="w-0 h-px bg-primary transition-all group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3">
              <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-background/40 mb-4">Account</h5>
              <ul className="space-y-2 text-[13px] font-sans">
                {(isLoggedIn
                  ? [
                      { href: "/portal", label: "Dashboard" },
                      { href: "/portal/quotations", label: "My Quotations" },
                      { href: "/portal/consultations", label: "Consultations" },
                      { href: "/knowledge", label: "Knowledge Center" },
                    ]
                  : [
                      { href: "/login", label: "Sign In" },
                      { href: "/signup", label: "Create Account" },
                      { href: "/knowledge", label: "Knowledge Center" },
                      { href: "/portal/consultations", label: "Book Consultation" },
                    ]
                ).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group flex items-center gap-2 text-background opacity-70 hover:opacity-100 transition-opacity">
                      <span className="w-0 h-px bg-primary transition-all group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full border-t border-background/10 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-mono text-background/30 uppercase tracking-[0.05em]">
              &copy; {new Date().getFullYear()} Chetan Hi-Tech Engineering. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[10px] text-background/30 font-sans uppercase tracking-wide">
              <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
