import React from "react";
import { cn } from "@/lib/utils";

interface SpecItem {
  label: string;
  value: string;
}

interface SpecificationSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  specs: SpecItem[];
}

export function SpecificationSheet({
  title,
  specs,
  className,
  ...props
}: SpecificationSheetProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-6 text-card-foreground shadow-[rgba(0,0,0,0.05)_0px_4px_24px] border border-border",
        className
      )}
      {...props}
    >
      <h3 className="mb-4 font-heading text-xl font-medium tracking-normal">{title}</h3>
      <div className="grid grid-cols-1 divide-y divide-border">
        {specs.map((spec, index) => (
          <div key={index} className="flex justify-between py-3">
            <span className="font-sans text-sm text-muted-foreground">{spec.label}</span>
            <span className="font-mono text-[13px] tracking-[-0.32px]">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
