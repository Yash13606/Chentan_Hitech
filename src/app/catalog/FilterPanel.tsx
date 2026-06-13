"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type FilterOption = { value: string; label: string };

export type FilterPanelProps = {
  categories: FilterOption[];
  industries: FilterOption[];
  availability: FilterOption[];
  totalResults: number;
};

// ─────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────
// FILTER PANEL
// ─────────────────────────────────────────────────────

export function FilterPanel({
  categories,
  industries,
  availability,
  totalResults,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live search input — local state, debounced, then pushed to URL
  const initialSearch = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounced(searchInput, 300);
  const lastPushedSearch = useRef(initialSearch);

  // Push debounced search to URL whenever it settles (and differs from URL)
  useEffect(() => {
    if (debouncedSearch === lastPushedSearch.current) return;
    lastPushedSearch.current = debouncedSearch;
    updateParam("search", debouncedSearch);
    // updateParam is stable via closure — eslint can be noisy here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep the local search in sync if the URL changes externally (e.g. clicking a chip)
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    if (urlSearch !== lastPushedSearch.current) {
      lastPushedSearch.current = urlSearch;
      setSearchInput(urlSearch);
    }
  }, [searchParams]);

  // ⌘K / Ctrl-K focuses the search input
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/catalog?${qs}` : "/catalog", { scroll: false });
    });
  }

  function clearAll() {
    setSearchInput("");
    lastPushedSearch.current = "";
    startTransition(() => router.push("/catalog", { scroll: false }));
  }

  const activeFiltersCount =
    (searchParams.get("industry") ? 1 : 0) +
    (searchParams.get("category") ? 1 : 0) +
    (searchParams.get("availability") ? 1 : 0);

  const hasActive = activeFiltersCount > 0 || !!searchInput;

  // ── Filter body (shared between desktop sidebar + mobile sheet) ──
  const body = (
    <div className="flex flex-col gap-6">
      {/* Section header with Clear all */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="text-xl font-heading font-medium text-foreground tracking-tight">
          Filters
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors uppercase tracking-widest"
          >
            [ Clear All ]
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Search */}
        <div className="border-b border-border pb-6">
          <label
            htmlFor="catalog-search"
            className="block text-[11px] font-mono font-medium text-foreground uppercase tracking-widest mb-3"
          >
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none"
              aria-hidden
            />
            <input
              id="catalog-search"
              ref={searchRef}
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search SKU, name, description…"
              className={cn(
                "w-full h-11 pl-10 pr-10 rounded-sm bg-surface-1 border border-border",
                "text-sm font-mono text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                "transition-all"
              )}
              aria-label="Search products"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <FilterGroup
            title="Industry"
            name="industry"
            options={industries}
            value={searchParams.get("industry") ?? ""}
            onChange={(v) => updateParam("industry", v)}
          />

          {categories.length > 0 && (
            <FilterGroup
              title="Category"
              name="category"
              options={categories}
              value={searchParams.get("category") ?? ""}
              onChange={(v) => updateParam("category", v)}
            />
          )}

          <FilterGroup
            title="Availability"
            name="availability"
            options={availability}
            value={searchParams.get("availability") ?? ""}
            onChange={(v) => updateParam("availability", v)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger row — visible <lg */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 h-11 px-5 rounded-sm border border-border bg-surface-1 text-sm font-mono uppercase tracking-widest text-foreground hover:bg-surface-2 transition-colors",
            (activeFiltersCount > 0 || searchInput) && "border-primary text-primary"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFiltersCount + (searchInput ? 1 : 0) > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1.5 grid place-items-center rounded-sm bg-primary text-primary-foreground text-[10px]">
              {activeFiltersCount + (searchInput ? 1 : 0)}
            </span>
          )}
        </button>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest tabular-nums">
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Filtering
            </span>
          ) : (
            <>[ {totalResults.toLocaleString("en-IN")} RESULTS ]</>
          )}
        </p>
      </div>

      {/* Desktop sidebar is handled by the parent CatalogClient, so we just render the body here, except on mobile where we render the trigger button and sheet. */}
      <div className="hidden lg:block w-full">
        <div className={cn("sticky top-24 w-full", isPending && "opacity-70 transition-opacity duration-300")}>
          {body}
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-modal"
            className="lg:hidden fixed inset-0 z-50 flex items-end"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="relative w-full max-h-[85vh] bg-background border-t border-border shadow-2xl flex flex-col"
              variants={{
                closed: { y: "100%" },
                open: { y: 0 },
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <p className="font-heading text-lg font-medium text-foreground">Filter Catalog</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 grid place-items-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">{body}</div>

              <div className="px-6 py-5 border-t border-border bg-surface-1">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full h-12 bg-primary text-primary-foreground text-sm font-mono uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                  ) : (
                    `Show ${totalResults} Results`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────
// FILTER GROUP — Collapsible accordion with mono radio list
// ─────────────────────────────────────────────────────

function FilterGroup({
  title,
  name,
  options,
  value,
  onChange,
}: {
  title: string;
  name: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-border pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <span className="text-[11px] font-mono font-medium text-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="filter-group-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-5 flex flex-col gap-1.5">
              {options.map((opt) => {
                const checked = value === opt.value;
                return (
                  <label
                    key={opt.value || "__all"}
                    className={cn(
                      "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-all border",
                      checked
                        ? "bg-foreground border-foreground text-background"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-surface-1 hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={checked}
                        onChange={() => onChange(opt.value)}
                        className="sr-only"
                      />
                      <span className="text-[11px] font-mono uppercase tracking-[0.1em] truncate">
                        {opt.label}
                      </span>
                    </span>
                    {checked && (
                      <div className="w-1.5 h-1.5 rounded-full bg-background" />
                    )}
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
