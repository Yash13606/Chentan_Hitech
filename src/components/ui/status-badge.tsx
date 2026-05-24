import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "success" | "warning" | "error" | "neutral";
  children: React.ReactNode;
}

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-sans text-xs font-medium",
        {
          "bg-[#27a644]/10 text-[#27a644]": status === "success",
          "bg-[#c96442]/10 text-[#c96442]": status === "warning",
          "bg-[#b53333]/10 text-[#b53333]": status === "error",
          "bg-muted text-muted-foreground": status === "neutral",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
