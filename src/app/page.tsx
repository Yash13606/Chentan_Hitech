"use client";

import React from "react";
import { motion } from "framer-motion";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";
import {
  ArrowRight,
  Package,
  Building2,
  ChefHat,
  Anchor,
  Shield,
  FileText,
  Search,
  ShoppingCart,
  Menu,
  CheckCircle2,
  Zap,
  Globe2,
  Award,
  ArrowUpRight,
  BookOpen
} from "lucide-react";

const BUNDLE_ITEMS = [
  { name: "Commercial Convection Oven", specs: "220V, Stainless Steel", qty: 2, price: "$4,500" },
  { name: "Walk-in Cooler Unit", specs: "8x10ft, Custom Shelving", qty: 1, price: "Configuring..." },
  { name: "Industrial Dishwasher", specs: "Under-counter, High Temp", qty: 3, price: "$2,100" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border z-50 flex items-center px-6">
        <div className="flex items-center gap-8 flex-1">
          <a href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-sm" />
            <span className="font-heading font-medium tracking-tight text-lg">Chetan Hi-Tech</span>
          </a>
          <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-foreground transition-colors">Industries</a>
            <a href="#" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="/catalog" className="hover:text-foreground transition-colors">Product Catalog</a>
            <a href="#" className="hover:text-foreground transition-colors">Projects</a>
            <a href="#" className="hover:text-foreground transition-colors">Knowledge Center</a>
            <a href="#" className="hover:text-foreground transition-colors">About</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hidden xl:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
            Describe Your Project
          </a>
          <IndustrialButton variant="tertiary" className="hidden md:flex">Login</IndustrialButton>
          <IndustrialButton>Request Quote</IndustrialButton>
          <button className="lg:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-0">
        {/* 1. Hero Section */}
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
            <IndustrialButton size="lg" className="w-full sm:w-auto gap-2">
              Explore Catalog <ArrowRight size={16} />
            </IndustrialButton>
            <IndustrialButton variant="secondary" size="lg" className="w-full sm:w-auto">
              AI Requirement Assistant
            </IndustrialButton>
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
            {/* Window Chrome */}
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
              {/* Sidebar */}
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

              {/* Main Content */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-heading font-medium tracking-normal text-foreground">Mumbai Navy Mess Setup</h2>
                    <p className="text-sm text-muted-foreground mt-1">Inquiry ID: <span className="font-mono text-foreground tracking-[-0.32px]">#CH-8832-NVY</span> • Priority: <span className="text-[#b53333] font-medium bg-[#b53333]/10 px-2 py-0.5 rounded">High</span></p>
                  </div>
                  <IndustrialButton variant="secondary" className="gap-2 shrink-0">
                    <ShoppingCart size={14} /> Submit Request
                  </IndustrialButton>
                </div>

                {/* Table */}
                <div className="border border-border rounded-lg overflow-x-auto bg-background">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground bg-surface-2 uppercase tracking-[0.4px]">
                        <th className="px-6 py-4 font-medium">Product / Spec</th>
                        <th className="px-6 py-4 font-medium w-24 text-center">Qty</th>
                        <th className="px-6 py-4 font-medium w-32 text-right">Est. Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-border">
                      {BUNDLE_ITEMS.map((item, i) => (
                        <tr key={i} className="hover:bg-surface-2 transition-colors">
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

                {/* AI Assistant Bubble in UI */}
                <div className="mt-8 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0 border border-border">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div className="bg-background border border-border rounded-xl p-5 max-w-lg text-sm text-muted-foreground shadow-[rgba(0,0,0,0.02)_0px_4px_12px]">
                    <strong className="text-foreground block mb-2 font-heading text-base font-medium">Engineering Recommendation</strong>
                    <p className="leading-relaxed">
                      For a mess facility serving 500+ personnel, we recommend adding the <span className="text-foreground font-medium border-b border-dashed border-border cursor-help">Heavy Duty Waste Disposer (1.5 HP)</span> to handle the organic load efficiently. Shall I add this to the cart?
                    </p>
                    <div className="mt-5 flex gap-3">
                      <IndustrialButton size="sm">Add to Cart</IndustrialButton>
                      <IndustrialButton variant="secondary" size="sm">Dismiss</IndustrialButton>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. Social Proof Bar */}
        <section className="py-16 mt-12 border-y border-border bg-surface-1">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="font-sans text-sm font-medium uppercase tracking-[0.4px] text-muted-foreground mb-8">
              Trusted by 200+ facilities across India
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Replace with real logos eventually */}
              <div className="font-heading font-medium text-2xl">TAJ HOTELS</div>
              <div className="font-heading font-medium text-2xl">APOLLO HOSPITALS</div>
              <div className="font-heading font-medium text-2xl">INDIAN NAVY</div>
              <div className="font-heading font-medium text-2xl">INFOSYS CAMPUS</div>
            </div>
          </div>
        </section>

        {/* 3. How It Works (Pro-Max Editorial) */}
        <section className="py-32 px-6 border-y border-border bg-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <p className="text-xs font-sans font-bold tracking-[0.15em] text-muted-foreground uppercase mb-6">Process</p>
              <h2 className="text-[clamp(40px,5vw,72px)] leading-[1.05] font-heading font-medium tracking-tight text-foreground mb-6">
                Procurement, <br/>
                <span className="text-muted-foreground italic font-normal">Simplified.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                We've compressed months of engineering guesswork into three deterministic steps to deploy enterprise infrastructure.
              </p>
            </div>
            
            <div className="lg:col-span-7 flex flex-col gap-0 mt-8 lg:mt-0">
              {[
                { step: "01", title: "Select Domain", desc: "Choose your industry sector or let our AI analyze your facility floorplan to generate exact capacity requirements." },
                { step: "02", title: "Build Quotation Cart", desc: "Compile heavy equipment, review precision technical specifications, and lock in your requirements for the RFQ." },
                { step: "03", title: "Finalize & Deploy", desc: "Our engineering sales team provides a finalized commercial offer, handles logistics, and manages the deployment." }
              ].map((item, i) => (
                <div key={i} className="group relative border-t border-border py-12 md:py-16 flex flex-col sm:flex-row gap-6 sm:gap-12 hover:bg-surface-1 transition-colors px-6 -mx-6 sm:px-8 sm:-mx-8 cursor-default overflow-hidden">
                  {/* Hover liquid fill for the top border */}
                  <div className="absolute top-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-700 ease-[0.16,1,0.3,1]"></div>
                  
                  <div className="text-6xl md:text-8xl font-heading font-light text-muted-foreground/20 group-hover:text-primary transition-colors duration-500 shrink-0 tracking-tighter leading-none mt-2">
                    {item.step}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-heading font-medium text-foreground mb-4 group-hover:translate-x-2 transition-transform duration-500 ease-[0.16,1,0.3,1]">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed md:text-lg group-hover:text-foreground transition-colors duration-500">{item.desc}</p>
                  </div>
                </div>
              ))}
              {/* Bottom border for the last item to close the stack */}
              <div className="border-t border-border w-full"></div>
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
            <IndustrialButton variant="tertiary" className="gap-2 shrink-0 border border-border">
              View Catalog <ArrowRight size={16} />
            </IndustrialButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IndustrialProductCard
              title="Continuous Flight Dishwasher"
              category="Warewashing"
              availability="in-stock"
              specs={[
                { label: "Output", value: "3000 plates/h" },
                { label: "Power", value: "3-Phase 400V" }
              ]}
            />
            <IndustrialProductCard
              title="Barrier Washer Extractor"
              category="Laundry Infrastructure"
              availability="made-to-order"
              specs={[
                { label: "Capacity", value: "50 kg/cycle" },
                { label: "G-Force", value: "350G" }
              ]}
            />
            <IndustrialProductCard
              title="Combi Oven 20-Grid"
              category="Kitchen Equipment"
              availability="low-stock"
              specs={[
                { label: "Capacity", value: "20x 1/1 GN" },
                { label: "Injection", value: "Direct Steam" }
              ]}
            />
          </div>
        </section>

        {/* 5. Solution Bundles by Domain (Bento Grid) */}
        <section className="py-20 px-6 bg-surface-1 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold tracking-[0.15em] text-muted-foreground uppercase mb-3">DOMAINS</p>
              <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-tight text-foreground">Solution Bundles by Industry</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Hospitality (Span 2) */}
              <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Hospitality</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-inverse-canvas rounded-lg flex items-center justify-center text-inverse-ink shadow-sm">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium">Hotel Kitchen Setup</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  A comprehensive cooking, prep, and warewashing line designed for 5-star operations serving 1000+ covers daily. Includes cold rooms and bakery zones.
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Modular cooking islands with integrated induction</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Walk-in blast chillers and multi-zone cold storage</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Automated rack-conveyor dishwashing systems</li>
                </ul>
              </div>

              {/* Card 2: Healthcare (Span 1) */}
              <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Healthcare</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-inverse-canvas rounded-lg flex items-center justify-center text-inverse-ink shadow-sm">
                    <Shield size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium">Hospital Laundry</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Infection-control compliant barrier washing and finishing equipment.
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Pass-through barrier washers</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Thermal disinfection cycles</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Clean-room segregation</li>
                </ul>
              </div>

              {/* Card 3: Defence (Span 1) */}
              <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Defence & Marine</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-inverse-canvas rounded-lg flex items-center justify-center text-inverse-ink shadow-sm">
                    <Anchor size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium">Naval Mess</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Heavy-duty, marine-grade infrastructure designed for high vibration environments.
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Flanged marine mounting legs</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> 316-grade stainless steel</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Anti-spill stormy rails</li>
                </ul>
              </div>

              {/* Card 4: Corporate (Span 2) */}
              <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
                <div className="text-[10px] font-sans font-bold tracking-[0.1em] text-muted-foreground uppercase mb-4">Industrial Canteens</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-inverse-canvas rounded-lg flex items-center justify-center text-inverse-ink shadow-sm">
                    <Package size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium">Corporate Cafeteria</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  High-throughput servery counters, bulk cooking kettles, and rapid dishwashing systems for tech parks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> 500-Liter tilting boiling pans</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Continuous flight dishwashers</li>
                  </ul>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Heated / Chilled drop-in displays</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Touchless cutlery dispensers</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. AI Requirement Assistant CTA (Minimalist Command Interface) */}
        <section className="py-32 px-6 bg-background relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 border border-border mb-8 shadow-sm">
              <Zap size={24} className="text-primary" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-foreground mb-6">
              Not sure what you need?
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
              Skip the manual sizing. Tell our engineering AI about your facility, and we'll instantly generate a compliant, phase-balanced equipment list.
            </p>
            
            {/* Massive interactive command bar */}
            <div className="relative max-w-3xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative flex flex-col md:flex-row items-center bg-surface-1 border border-border rounded-2xl p-2 shadow-xl">
                <div className="flex-1 w-full flex items-center px-4 py-3 md:py-0">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-4 shrink-0 shadow-[0_0_8px_rgba(255,102,0,0.8)]"></div>
                  <input 
                    type="text" 
                    placeholder="e.g. 500-bed hospital kitchen serving 3 meals a day..." 
                    className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 text-base md:text-lg cursor-text"
                  />
                </div>
                
                <button className="w-full md:w-auto mt-2 md:mt-0 whitespace-nowrap inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-sans text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md">
                  Generate Loadout <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Instant Calculation</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Global Standards</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Export to RFQ</span>
            </div>
          </div>
        </section>

        {/* 8. Why Chetan Hi-Tech (Pro-Max Single View) */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto bg-inverse-canvas text-inverse-ink rounded-[24px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden border border-inverse-surface-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent opacity-60"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 relative z-10 items-center">
              
              {/* Left: Narrative & Features */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="mb-10">
                  <p className="text-[10px] font-sans font-bold tracking-[0.15em] text-primary uppercase mb-4">Why Chetan Hi-Tech</p>
                  <h2 className="text-3xl md:text-5xl font-heading font-medium tracking-tight leading-[1.1] mb-6">
                    We don't just supply equipment.<br/>
                    <span className="text-muted-foreground italic font-normal">We engineer environments.</span>
                  </h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
                    With over two decades of infrastructure deployment, we bring unmatched operational expertise to your facility.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8">
                  {[
                    { icon: Globe2, label: "Pan-India Reach" },
                    { icon: CheckCircle2, label: "End-to-End Execution" },
                    { icon: Award, label: "Tier 1 Partnerships" }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-inverse-surface-1 border border-inverse-surface-2 flex items-center justify-center shrink-0">
                         <feature.icon size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium tracking-[0.2px]">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: The Data/Metrics */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-inverse-surface-1 border border-inverse-surface-1 rounded-2xl overflow-hidden shadow-inner mt-8 lg:mt-0">
                <div className="bg-[#111110] p-6 md:p-8 flex flex-col justify-center hover:bg-inverse-surface-1/30 transition-colors group">
                  <div className="text-4xl md:text-5xl font-heading font-light text-white mb-2 group-hover:scale-105 transition-transform origin-left duration-300">25<span className="text-primary font-medium">+</span></div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Years Exp</div>
                </div>
                <div className="bg-[#111110] p-6 md:p-8 flex flex-col justify-center hover:bg-inverse-surface-1/30 transition-colors group">
                  <div className="text-4xl md:text-5xl font-heading font-light text-white mb-2 group-hover:scale-105 transition-transform origin-left duration-300">500<span className="text-primary font-medium">+</span></div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Projects</div>
                </div>
                <div className="bg-[#111110] p-6 md:p-8 flex flex-col justify-center hover:bg-inverse-surface-1/30 transition-colors group">
                  <div className="text-4xl md:text-5xl font-heading font-light text-white mb-2 group-hover:scale-105 transition-transform origin-left duration-300">ISO</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Certified</div>
                </div>
                <div className="bg-[#111110] p-6 md:p-8 flex flex-col justify-center hover:bg-inverse-surface-1/30 transition-colors group">
                  <div className="text-4xl md:text-5xl font-heading font-light text-white mb-2 group-hover:scale-105 transition-transform origin-left duration-300">24/7</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Support</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 9. Knowledge Center Preview */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-normal text-foreground">Engineering Insights</h2>
              <p className="text-muted-foreground mt-2 text-lg">Case studies, compliance updates, and operational strategies.</p>
            </div>
            <IndustrialButton variant="tertiary" className="gap-2 shrink-0 border border-border">
              View All Articles <ArrowRight size={16} />
            </IndustrialButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tag: "Case Study", title: "Scaling Laundry Operations for 500-Bed Hospitals", time: "5 min read" },
              { tag: "Compliance", title: "Naval Mess Hygiene Standards Update 2026", time: "8 min read" },
              { tag: "Engineering", title: "Calculating HVAC Loads for Commercial Kitchens", time: "12 min read" },
            ].map((article, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[16/10] bg-surface-2 rounded-lg border border-border mb-4 overflow-hidden flex items-center justify-center">
                  <BookOpen size={32} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono px-2 py-1 bg-secondary rounded text-muted-foreground">{article.tag}</span>
                  <span className="text-xs text-muted-foreground">{article.time}</span>
                </div>
                <h4 className="font-heading text-xl font-medium group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                  {article.title}
                  <ArrowUpRight size={18} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Consultation CTA Banner */}
        <section className="py-32 px-6 relative overflow-hidden bg-inverse-canvas text-inverse-ink border-t border-border">
          {/* Grain overlay for physical paper/industrial texture */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
          
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               >
                 <h2 className="text-[clamp(48px,6vw,96px)] leading-[0.95] font-heading font-medium tracking-tight mb-8">
                   <span className="block text-muted-foreground italic font-normal text-3xl md:text-4xl mb-4">The next step.</span>
                   Planning a <br/>
                   <span className="text-primary italic">facility</span> setup?
                 </h2>
               </motion.div>
            </div>
            
            <div className="md:col-span-5 flex flex-col items-start md:pl-12 md:border-l border-inverse-surface-1">
               <motion.p 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10"
               >
                 Don't leave enterprise infrastructure to guesswork. Book a free site consultation with our engineering team today.
               </motion.p>
               
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.3 }}
                 className="flex flex-col w-full gap-4"
               >
                 <button className="group relative w-full inline-flex h-16 items-center justify-between rounded-full bg-primary px-8 font-sans text-lg font-medium text-primary-foreground overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                   <span className="relative z-10">Book Free Consultation</span>
                   <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm group-hover:bg-background/30 transition-colors">
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                   {/* Liquid hover fill */}
                   <div className="absolute inset-0 z-0 bg-[#b53333] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] rounded-full"></div>
                 </button>
                 
                 <button className="group w-full inline-flex h-16 items-center justify-center rounded-full border border-inverse-surface-1 bg-transparent px-8 font-sans text-lg font-medium text-inverse-ink transition-colors hover:bg-inverse-surface-1 hover:border-inverse-surface-2 active:scale-[0.98]">
                   Contact Sales
                 </button>
               </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      {/* 11. Pro-Max Editorial Footer */}
      <footer className="bg-inverse-canvas text-inverse-ink pt-10 pb-0 overflow-hidden relative">
        {/* Massive Typography Backdrop - Absolutely positioned to prevent vertical space usage */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center opacity-[0.03] select-none pointer-events-none translate-y-[25%] z-0">
          <span className="text-[18vw] leading-none font-heading font-medium tracking-tighter whitespace-nowrap">
            CHETAN HI-TECH
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            <div className="md:col-span-5 pr-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-primary rounded-sm shadow-[0_0_0_1px_rgba(255,255,255,0.1)]" />
                <span className="font-heading font-medium tracking-tight text-lg text-inverse-ink">Chetan Hi-Tech</span>
              </div>
              <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed mb-4">
                An industrial procurement and digital quotation platform engineered for enterprise-scale facility setups and complex B2B infrastructure deployments.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Platform</h5>
              <ul className="space-y-2 text-[13px] font-sans">
                <li><a href="/catalog" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Equipment Catalog</a></li>
                <li><a href="/cart" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Quotation Builder</a></li>
                <li><a href="/crm" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Lead Dashboard</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Industries</h5>
              <ul className="space-y-2 text-[13px] font-sans">
                <li><a href="#" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Hospitality</a></li>
                <li><a href="#" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Healthcare</a></li>
                <li><a href="#" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Defence & Marine</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-3">
              <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Company</h5>
              <ul className="space-y-2 text-[13px] font-sans">
                <li><a href="#" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Engineering Team</a></li>
                <li><a href="#" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Global Network</a></li>
                <li><a href="#" className="group flex items-center gap-2 text-inverse-ink opacity-70 hover:opacity-100 transition-opacity"><span className="w-0 h-px bg-primary transition-all group-hover:w-3"></span>Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="w-full border-t border-inverse-surface-1 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.05em]">
              © {new Date().getFullYear()} Chetan Hi-Tech Engineering. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[10px] text-muted-foreground font-sans uppercase tracking-wide">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
