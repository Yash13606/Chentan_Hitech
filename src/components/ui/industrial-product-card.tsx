import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { Lock } from "lucide-react";
import { RfqAddButton } from "@/components/cart/rfq-add-button";

interface IndustrialProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  productId: string;
  title: string;
  category: string;
  slug: string;
  sku: string;
  imagePlaceholder?: string;
  imageKey?: string; // R2 image key
  specs: { label: string; value: string }[];
  availability: "in-stock" | "made-to-order" | "low-stock";
  priceCents?: number;
  isLoggedIn?: boolean;
  /** Current qty in the user's cart (DB cart for authed, 0 for guest's first paint) */
  initialQty?: number;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1590496736639-6541f4864fa9?w=600&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80",
  "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=600&q=80",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80",
  "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=600&q=80"
];

export function IndustrialProductCard({
  productId,
  title,
  category,
  slug,
  sku,
  imagePlaceholder,
  imageKey,
  specs,
  availability,
  priceCents,
  isLoggedIn = false,
  initialQty = 0,
  className,
  ...props
}: IndustrialProductCardProps) {
  const detailHref = `/products/${slug}`;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-[rgba(0,0,0,0.05)_0px_4px_24px] border border-border transition-all hover:shadow-[rgba(0,0,0,0.08)_0px_8px_32px]",
        className
      )}
      {...props}
    >
      <div className="aspect-[4/3] w-full bg-muted/50 flex flex-col justify-between p-5 relative overflow-hidden">
        {/* Subtle grid background — feels like technical drawing paper */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex items-start justify-between">
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
          {sku && (
            <div className="font-mono text-[10px] tracking-wider text-muted-foreground/70 uppercase">
              {sku}
            </div>
          )}
        </div>

        <div className="relative z-10">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground/90 mix-blend-difference text-white">
            {category}
          </p>
        </div>
        
        {/* Render actual image if provided, otherwise Unsplash fallback */}
        <div className="absolute inset-0 z-0">
          <img 
            src={imageKey || FALLBACK_IMAGES[(sku.charCodeAt(0) || 0) % FALLBACK_IMAGES.length]} 
            alt={title}
            className="object-cover w-full h-full opacity-80 mix-blend-multiply" 
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 font-sans text-[13px] font-medium tracking-[0.4px] uppercase text-muted-foreground">
          {category}
        </div>
        <h3 className="mb-4 font-heading text-2xl font-medium tracking-normal text-foreground">
          {title}
        </h3>

        <div className="mb-4 grid grid-cols-2 gap-4">
          {specs.map((spec, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-sans text-xs text-muted-foreground mb-1">{spec.label}</span>
              <span className="font-mono text-[13px] tracking-[-0.32px]">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Price or gate */}
        <div className="mb-4">
          {isLoggedIn ? (
            priceCents ? (
              <div className="font-mono text-sm font-medium text-foreground">
                {formatPrice(priceCents)}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Pricing on request</div>
            )
          ) : (
            <Link
              href="/signup"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Sign in for pricing
            </Link>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-border flex justify-between items-center gap-3">
          <Link
            href={detailHref}
            className="font-sans text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground transition-colors"
          >
            View details
          </Link>
          <RfqAddButton
            productId={productId}
            title={title}
            sku={sku}
            slug={slug}
            priceCents={priceCents ?? null}
            initialQty={initialQty}
          />
        </div>
      </div>
    </div>
  );
}
