import React from "react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Inbox, CheckCircle2, Clock, FileText, ChevronDown } from "lucide-react";

export default function CRMPage() {
  const leads = [
    {
      id: "REQ-8892A",
      client: "Apollo Hospitals Ltd.",
      type: "New Facility Setup",
      priority: "high",
      status: "pending_review",
      date: "2 hours ago",
      value: "Est. ₹1.2M",
      items: 12,
    },
    {
      id: "REQ-8891B",
      client: "Taj Hotels Resort",
      type: "Equipment Replacement",
      priority: "medium",
      status: "quoting",
      date: "5 hours ago",
      value: "Est. ₹450K",
      items: 4,
    },
    {
      id: "REQ-8890C",
      client: "Naval Base Canteen",
      type: "Facility Expansion",
      priority: "high",
      status: "pending_review",
      date: "1 day ago",
      value: "Est. ₹2.8M",
      items: 45,
    },
    {
      id: "REQ-8889D",
      client: "TechPark Cafeteria",
      type: "Equipment Replacement",
      priority: "low",
      status: "quoted",
      date: "2 days ago",
      value: "Est. ₹120K",
      items: 2,
    },
    {
      id: "REQ-8888E",
      client: "City Central Kitchens",
      type: "New Facility Setup",
      priority: "medium",
      status: "quoted",
      date: "3 days ago",
      value: "Est. ₹890K",
      items: 18,
    },
  ];

  return (
    <div className="min-h-screen bg-inverse-canvas text-inverse-ink flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-inverse-surface-1 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-inverse-surface-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-sm bg-primary" />
            <span className="font-heading font-medium text-lg">Chetan CRM</span>
          </div>
        </div>
        <div className="p-4 flex-1">
          <nav className="space-y-1 font-sans text-sm">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-inverse-surface-1 text-primary-foreground">
              <div className="flex items-center gap-3">
                <Inbox size={16} />
                <span>Lead Inbox</span>
              </div>
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-mono">12</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md text-muted-foreground hover:bg-inverse-surface-1 hover:text-foreground cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Clock size={16} />
                <span>Active Quotes</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono">8</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md text-muted-foreground hover:bg-inverse-surface-1 hover:text-foreground cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} />
                <span>Converted</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md text-muted-foreground hover:bg-inverse-surface-1 hover:text-foreground cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={16} />
                <span>All Projects</span>
              </div>
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-inverse-surface-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-surface-1 text-foreground flex items-center justify-center font-heading font-medium text-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-medium">Sales Admin</span>
              <span className="font-sans text-xs text-muted-foreground">Engineering</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-inverse-surface-1 flex items-center justify-between px-6 shrink-0">
          <h1 className="font-heading text-xl font-medium">Quotation Lead Inbox</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search ID, Client..." 
                className="w-64 h-9 bg-inverse-surface-1 border border-inverse-surface-1 rounded-md pl-10 pr-4 text-sm focus:outline-none focus:border-[#3898ec] text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <IndustrialButton variant="secondary" size="sm" className="bg-inverse-surface-1 border-inverse-surface-1 text-foreground hover:bg-inverse-surface-2 shadow-none">
              <Filter size={14} className="mr-2" /> Filter
            </IndustrialButton>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "New Requests (24h)", value: "12", trend: "+3 from yesterday" },
              { label: "Pending Review", value: "8", trend: "Requires attention" },
              { label: "Avg. Quote Turnaround", value: "14h", trend: "-2h this week" },
              { label: "Conversion Rate", value: "68%", trend: "+5% this month" },
            ].map((metric, i) => (
              <div key={i} className="bg-inverse-surface-1 rounded-lg p-5 border border-inverse-surface-1 shadow-sm">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.4px] text-muted-foreground mb-2">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-medium text-foreground">{metric.value}</span>
                </div>
                <p className="font-sans text-xs text-muted-foreground mt-2">{metric.trend}</p>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-inverse-surface-1 rounded-lg border border-inverse-surface-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans whitespace-nowrap">
                <thead className="text-xs uppercase tracking-[0.4px] text-muted-foreground bg-inverse-surface-1 border-b border-inverse-surface-2">
                  <tr>
                    <th className="px-6 py-4 font-medium">Request ID</th>
                    <th className="px-6 py-4 font-medium">Client / Domain</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Value / Scope</th>
                    <th className="px-6 py-4 font-medium text-right">Age</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inverse-surface-2 bg-[#1a1a19]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-inverse-surface-1 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm tracking-[-0.32px] text-foreground">{lead.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm text-foreground mb-0.5">{lead.client}</p>
                        <p className="text-xs text-muted-foreground">{lead.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        {lead.priority === "high" && <StatusBadge status="error">High Priority</StatusBadge>}
                        {lead.priority === "medium" && <StatusBadge status="warning">Standard</StatusBadge>}
                        {lead.priority === "low" && <StatusBadge status="neutral">Low Priority</StatusBadge>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            lead.status === 'pending_review' ? 'bg-[#c96442]' :
                            lead.status === 'quoting' ? 'bg-[#3898ec]' :
                            'bg-[#27a644]'
                          }`} />
                          <span className="text-sm capitalize text-muted-foreground">
                            {lead.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-foreground mb-0.5">{lead.value}</p>
                        <p className="text-xs text-muted-foreground">{lead.items} Equipment Items</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {lead.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronDown size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
