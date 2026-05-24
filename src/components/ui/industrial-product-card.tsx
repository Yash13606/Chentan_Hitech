import React from "react";
import { cn } from "@/lib/utils";
import { IndustrialButton } from "./industrial-button";
import { StatusBadge } from "./status-badge";
import { Plus } from "lucide-react";

interface IndustrialProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  category: string;
  imagePlaceholder?: string;
  specs: { label: string; value: string }[];
  availability: "in-stock" | "made-to-order" | "low-stock";
}

export function IndustrialProductCard({
  title,
  category,
  imagePlaceholder,
  specs,
  availability,
  className,
  ...props
}: IndustrialProductCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-[rgba(0,0,0,0.05)_0px_4px_24px] border border-border transition-all hover:shadow-[rgba(0,0,0,0.08)_0px_8px_32px]",
        className
      )}
      {...props}
    >
      <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center p-6 relative">
        <div className="absolute top-4 left-4">
          <StatusBadge
            status={
              availability === "in-stock"
                ? "success"
                : availability === "low-stock"
                ? "warning"
                : "neutral"
            }
          >
            {availability === "in-stock"
              ? "Ready Stock"
              : availability === "low-stock"
              ? "Low Stock"
              : "Made to Order"}
          </StatusBadge>
        </div>
        <div className="text-muted-foreground font-mono text-xs opacity-50">
          [Image: {imagePlaceholder || title}]
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 font-sans text-[13px] font-medium tracking-[0.4px] uppercase text-muted-foreground">
          {category}
        </div>
        <h3 className="mb-4 font-heading text-2xl font-medium tracking-normal text-foreground">
          {title}
        </h3>
        
        <div className="mb-6 grid grid-cols-2 gap-4">
          {specs.map((spec, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-sans text-xs text-muted-foreground mb-1">{spec.label}</span>
              <span className="font-mono text-[13px] tracking-[-0.32px]">{spec.value}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
          <span className="font-sans text-sm text-muted-foreground underline decoration-border underline-offset-4 cursor-pointer hover:text-foreground">
            View details
          </span>
          <IndustrialButton variant="secondary" size="sm" className="gap-2">
            <Plus size={14} /> Add to RFQ
          </IndustrialButton>
        </div>
      </div>
    </div>
  );
}
