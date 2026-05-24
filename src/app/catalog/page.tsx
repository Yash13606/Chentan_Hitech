import React from "react";
import { IndustrialProductCard } from "@/components/ui/industrial-product-card";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export default function CatalogPage() {
  const products = [
    {
      title: "Commercial Combi Oven 10-Grid",
      category: "Kitchen Equipment",
      availability: "in-stock" as const,
      specs: [
        { label: "Capacity", value: "10 x 1/1 GN" },
        { label: "Power", value: "18.6 kW / 3-Phase" },
        { label: "Dimensions", value: "850 x 842 x 1014 mm" },
        { label: "SKU", value: "KCH-COM-10G" },
      ],
    },
    {
      title: "Heavy-Duty Planetary Mixer 40L",
      category: "Bakery Equipment",
      availability: "in-stock" as const,
      specs: [
        { label: "Bowl Capacity", value: "40 Liters" },
        { label: "Speeds", value: "3-Speed Gear-Driven" },
        { label: "Power", value: "1.5 HP" },
        { label: "SKU", value: "BKY-PMX-40L" },
      ],
    },
    {
      title: "Industrial Barrier Washer Extractor",
      category: "Laundry Infrastructure",
      availability: "made-to-order" as const,
      specs: [
        { label: "Load Capacity", value: "50 kg / cycle" },
        { label: "Extraction", value: "350 G-Force" },
        { label: "Heating", value: "Steam / Electric" },
        { label: "SKU", value: "LND-BWE-50K" },
      ],
    },
    {
      title: "Walk-In Blast Chiller Chamber",
      category: "Cooling & Storage",
      availability: "made-to-order" as const,
      specs: [
        { label: "Trolley Cap.", value: "2 x 20 GN 1/1" },
        { label: "Chilling Rate", value: "200 kg (+90°C to +3°C)" },
        { label: "Compressor", value: "Remote Bitzer" },
        { label: "SKU", value: "CLG-WBC-200K" },
      ],
    },
    {
      title: "Continuous Flight Dishwasher",
      category: "Warewashing",
      availability: "low-stock" as const,
      specs: [
        { label: "Output", value: "3000 plates/hour" },
        { label: "Water Usage", value: "1.2 L / rack" },
        { label: "Zones", value: "Pre-wash, Wash, Rinse" },
        { label: "SKU", value: "WSH-CFD-3K" },
      ],
    },
    {
      title: "Hospital Grade Autoclave Sterilizer",
      category: "Healthcare Infrastructure",
      availability: "made-to-order" as const,
      specs: [
        { label: "Volume", value: "250 Liters" },
        { label: "Pressure", value: "Vacuum-Assisted" },
        { label: "Cycle", value: "134°C / 4 minutes" },
        { label: "SKU", value: "HLT-AUT-250L" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <a href="/" className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary rounded-sm" />
              <span className="font-heading font-medium tracking-tight text-lg">Chetan Hi-Tech</span>
            </a>
            <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <a href="#" className="hover:text-foreground transition-colors">Industries</a>
              <a href="#" className="hover:text-foreground transition-colors">Solutions</a>
              <a href="/catalog" className="text-primary transition-colors">Product Catalog</a>
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-inverse-canvas text-inverse-ink py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="font-sans text-sm font-medium tracking-[0.4px] text-muted-foreground uppercase mb-4">
            Industrial Procurement Platform
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-medium tracking-normal mb-6">
            Equipment Catalog
          </h1>
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Browse our comprehensive database of commercial and industrial infrastructure. Add items to your quotation cart to request a formalized RFQ, or consult our engineering team for sizing.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="flex-1 py-12 px-6 container mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex flex-col gap-8 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-heading text-lg font-medium">Filters</h3>
            <SlidersHorizontal size={18} className="text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-sans text-sm font-medium uppercase tracking-[0.4px] text-muted-foreground">Search</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="SKU or keyword..." 
                className="w-full h-10 bg-surface-2 border border-border rounded-md pl-10 pr-4 text-sm focus:outline-none focus:border-[#3898ec]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-sans text-sm font-medium uppercase tracking-[0.4px] text-muted-foreground">Industry Domain</h4>
            <div className="flex flex-col gap-3">
              {['Hospitality', 'Healthcare', 'Defence & Marine', 'Industrial Canteens'].map((domain) => (
                <label key={domain} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-border flex items-center justify-center group-hover:border-primary transition-colors"></div>
                  <span className="text-sm font-sans">{domain}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-sans text-sm font-medium uppercase tracking-[0.4px] text-muted-foreground">Category</h4>
            <div className="flex flex-col gap-3">
              {['Kitchen Equipment', 'Laundry Infrastructure', 'Cooling & Storage', 'Warewashing'].map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-border flex items-center justify-center group-hover:border-primary transition-colors"></div>
                  <span className="text-sm font-sans">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <span className="text-sm text-muted-foreground font-sans">Showing 142 results</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-sans">Sort by:</span>
              <select className="bg-transparent text-sm font-sans border-none focus:ring-0 cursor-pointer">
                <option>Relevance</option>
                <option>Popularity</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product, idx) => (
              <IndustrialProductCard
                key={idx}
                title={product.title}
                category={product.category}
                availability={product.availability}
                specs={product.specs}
              />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <IndustrialButton variant="secondary" className="w-full md:w-auto">
              Load More Equipment
            </IndustrialButton>
          </div>
        </div>
      </section>
    </div>
  );
}
