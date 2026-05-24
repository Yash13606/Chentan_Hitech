import React from "react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { Trash2, MessageSquare, AlertCircle, Calendar } from "lucide-react";

export default function CartPage() {
  const cartItems = [
    {
      id: "KCH-COM-10G",
      title: "Commercial Combi Oven 10-Grid",
      specs: "18.6 kW / 3-Phase",
      quantity: 2,
    },
    {
      id: "CLG-WBC-200K",
      title: "Walk-In Blast Chiller Chamber",
      specs: "Remote Bitzer Compressor",
      quantity: 1,
    },
    {
      id: "BKY-PMX-40L",
      title: "Heavy-Duty Planetary Mixer 40L",
      specs: "3-Speed Gear-Driven",
      quantity: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Nav (simplified for the page view) */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-primary" />
            <span className="font-heading font-medium tracking-tight text-lg">Chetan Hi-Tech</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-sans text-muted-foreground mr-4">Project ID: #REQ-8892A</span>
            <IndustrialButton variant="secondary">Save Draft</IndustrialButton>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-6 container mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-normal mb-4">
            Quotation Request
          </h1>
          <p className="font-sans text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Review your selected infrastructure below. Adjust quantities and add necessary technical notes for our engineering team before submitting your RFQ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Cart Table Area */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-surface-1 border border-border rounded-lg shadow-[rgba(0,0,0,0.05)_0px_4px_24px] overflow-hidden">
              <div className="border-b border-border p-6 bg-surface-2 flex items-center justify-between">
                <h3 className="font-heading text-xl font-medium">Equipment List</h3>
                <span className="font-sans text-sm text-muted-foreground">{cartItems.length} items</span>
              </div>
              
              <div className="p-6">
                <table className="w-full text-left font-sans">
                  <thead className="text-xs uppercase tracking-[0.4px] text-muted-foreground border-b border-border">
                    <tr>
                      <th className="pb-4 font-medium w-1/2">Product & SKU</th>
                      <th className="pb-4 font-medium text-center">Qty</th>
                      <th className="pb-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-6 pr-4">
                          <p className="font-medium text-base text-foreground mb-1">{item.title}</p>
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs text-muted-foreground tracking-[-0.32px]">{item.id}</span>
                            <span className="text-sm text-muted-foreground">{item.specs}</span>
                          </div>
                          
                          <div className="mt-4 flex items-start gap-2">
                            <MessageSquare size={14} className="text-muted-foreground mt-0.5" />
                            <input 
                              type="text" 
                              placeholder="Add technical notes (e.g. requires 220V)..." 
                              className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 text-foreground placeholder:text-muted-foreground/50"
                            />
                          </div>
                        </td>
                        <td className="py-6 px-2 align-top text-center">
                          <input 
                            type="number" 
                            defaultValue={item.quantity} 
                            min={1}
                            className="w-16 h-9 text-center bg-surface-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:border-[#3898ec]"
                          />
                        </td>
                        <td className="py-6 pl-4 align-top text-right">
                          <button className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-surface-2">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg shadow-[rgba(0,0,0,0.05)_0px_4px_24px] p-6">
              <h3 className="font-heading text-xl font-medium mb-6">Project Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm font-medium text-foreground">Project Type</label>
                  <select className="h-10 bg-surface-2 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-[#3898ec] font-sans">
                    <option>New Facility Setup</option>
                    <option>Equipment Replacement</option>
                    <option>Facility Expansion</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm font-medium text-foreground">Expected Timeline</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <select className="w-full h-10 bg-surface-2 border border-border rounded-md pl-10 pr-3 text-sm focus:outline-none focus:border-[#3898ec] font-sans">
                      <option>Immediate (1-2 weeks)</option>
                      <option>Next 30 days</option>
                      <option>Planning Phase (3+ months)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-sans text-sm font-medium text-foreground">Additional Notes</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe any specific site constraints, delivery requirements, or installation needs..."
                    className="bg-surface-2 border border-border rounded-md p-3 text-sm focus:outline-none focus:border-[#3898ec] font-sans resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-1 border border-border rounded-lg shadow-[rgba(0,0,0,0.05)_0px_4px_24px] p-6 sticky top-24">
              <h3 className="font-heading text-xl font-medium mb-6">Quotation Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-sans">Total Equipment Items</span>
                  <span className="font-mono">6 Units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-sans">Project Category</span>
                  <span className="font-sans">Hospitality</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-sans">Estimated Volume</span>
                  <span className="font-sans text-[#c96442] font-medium">Large Scale</span>
                </div>
              </div>

              <div className="bg-surface-2 rounded-md p-4 mb-8 flex items-start gap-3">
                <AlertCircle size={16} className="text-[#c96442] shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Submitting this request will forward your requirements to our engineering team. An official quotation PDF with pricing will be generated within 24 hours.
                </p>
              </div>

              <IndustrialButton className="w-full h-12 text-base shadow-none">
                Submit RFQ
              </IndustrialButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
