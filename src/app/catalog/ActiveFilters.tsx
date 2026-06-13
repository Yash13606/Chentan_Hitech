"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

type ChipDef = {
  key: string;
  param: string;
  label: string;
};

export function ActiveFilters({
  industries,
  categories,
}: {
  industries: { value: string; label: string }[];
  categories: { value: string; label: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const industry = searchParams.get("industry") ?? "";
  const category = searchParams.get("category") ?? "";
  const availability = searchParams.get("availability") ?? "";

  const chips: ChipDef[] = [];

  if (search) {
    chips.push({
      key: `search:${search}`,
      param: "search",
      label: `“${search}”`,
    });
  }
  if (industry) {
    const match = industries.find((i) => i.value === industry);
    if (match) chips.push({ key: `industry:${industry}`, param: "industry", label: match.label });
  }
  if (category) {
    const match = categories.find((c) => c.value === category);
    if (match) chips.push({ key: `category:${category}`, param: "category", label: match.label });
  }
  if (availability) {
    const label =
      availability === "IN_STOCK"
        ? "In Stock"
        : availability === "MADE_TO_ORDER"
          ? "Made to Order"
          : availability;
    chips.push({ key: `availability:${availability}`, param: "availability", label });
  }

  if (chips.length === 0) return null;

  function removeOne(param: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    params.delete("page");
    const qs = params.toString();
    startTransition(() =>
      router.push(qs ? `/catalog?${qs}` : "/catalog", { scroll: false })
    );
  }

  function clearAll() {
    startTransition(() => router.push("/catalog", { scroll: false }));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-wrap transition-opacity",
        isPending && "opacity-60"
      )}
    >
      <span className="text-sm font-heading italic text-muted-foreground mr-3">
        Filtering by
      </span>

      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.button
            layout
            key={chip.key}
            type="button"
            onClick={() => removeOne(chip.param)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-center gap-2 pb-0.5 border-b border-border hover:border-foreground transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-foreground">
              {chip.label}
            </span>
            <X className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>
        ))}
      </AnimatePresence>

      {chips.length >= 2 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-4 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
