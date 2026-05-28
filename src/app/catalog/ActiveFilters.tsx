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
        "flex items-center gap-2 flex-wrap mb-5 transition-opacity",
        isPending && "opacity-60"
      )}
    >
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.14em] mr-1">
        Filtering by
      </span>

      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.button
            layout
            key={chip.key}
            type="button"
            onClick={() => removeOne(chip.param)}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="group inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            aria-label={`Remove ${chip.label} filter`}
          >
            <span className="max-w-[14rem] truncate">{chip.label}</span>
            <span className="w-4 h-4 grid place-items-center rounded-full bg-background/15 group-hover:bg-background/25 transition-colors">
              <X className="w-2.5 h-2.5" />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {chips.length >= 2 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
