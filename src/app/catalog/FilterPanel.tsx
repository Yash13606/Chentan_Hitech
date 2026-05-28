"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

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
    <div className="flex flex-col gap-7">
      {/* Section header with Clear all */}
      <div className="flex items-baseline justify-between -mb-2">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.14em]">
          Filters
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-medium text-foreground/70 hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label
          htmlFor="catalog-search"
          className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.14em] mb-2.5"
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
              "w-full h-10 pl-9 pr-16 rounded-md bg-background border border-border",
              "text-sm text-foreground placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-colors"
            )}
            aria-label="Search products"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 h-5 px-1.5 rounded border border-border bg-muted/50 text-[10px] font-mono text-muted-foreground select-none">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

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
  );

  return (
    <>
      {/* Mobile trigger row — visible <lg */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/40 transition-colors",
            (activeFiltersCount > 0 || searchInput) && "border-foreground"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFiltersCount + (searchInput ? 1 : 0) > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1.5 grid place-items-center rounded-full bg-foreground text-background text-[11px] font-mono">
              {activeFiltersCount + (searchInput ? 1 : 0)}
            </span>
          )}
        </button>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Filtering
            </span>
          ) : (
            <>{totalResults.toLocaleString("en-IN")} results</>
          )}
        </p>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:block w-60 shrink-0",
          isPending && "opacity-70 transition-opacity"
        )}
        aria-label="Filters"
      >
        <div className="sticky top-24">{body}</div>
      </aside>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-background border-t border-border rounded-t-2xl shadow-2xl flex flex-col"
              variants={{
                closed: { y: "100%" },
                open: { y: 0 },
              }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <p className="font-heading text-base font-medium">Filters</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">{body}</div>

              <div className="px-5 py-4 border-t border-border bg-card">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full h-11 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  {isPending ? "Updating…" : `Show ${totalResults} results`}
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
// FILTER GROUP — radio list with active pill state
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
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.14em] mb-2.5">
        {title}
      </p>
      <div className="flex flex-col">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value || "__all"}
              className={cn(
                "group flex items-center justify-between gap-3 -mx-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                checked
                  ? "bg-foreground/[0.04] text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
              )}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "relative w-3.5 h-3.5 rounded-full border transition-colors shrink-0",
                    checked
                      ? "border-foreground"
                      : "border-border group-hover:border-muted-foreground"
                  )}
                  aria-hidden
                >
                  {checked && (
                    <span className="absolute inset-1 rounded-full bg-foreground" />
                  )}
                </span>
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <span className="text-sm leading-tight truncate">
                  {opt.label}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
