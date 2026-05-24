import React from "react";
import { cn } from "@/lib/utils";

interface IndustrialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "inverse" | "tertiary";
  size?: "default" | "sm" | "lg";
}

export const IndustrialButton = React.forwardRef<HTMLButtonElement, IndustrialButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground shadow-[0px_0px_0px_0px_var(--color-primary),0px_0px_0px_1px_var(--color-primary)] hover:bg-primary-hover": variant === "primary",
            "bg-secondary text-secondary-foreground shadow-[0px_0px_0px_0px_var(--color-secondary),0px_0px_0px_1px_var(--color-border)] hover:opacity-90": variant === "secondary",
            "bg-background text-foreground hover:bg-muted": variant === "tertiary",
            "bg-foreground text-background shadow-[0px_0px_0px_0px_var(--color-foreground),0px_0px_0px_1px_var(--color-border)] hover:opacity-90": variant === "inverse",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
IndustrialButton.displayName = "IndustrialButton";
