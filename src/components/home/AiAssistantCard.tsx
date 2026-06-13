"use client";

import { useState } from "react";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { IndustrialButton } from "@/components/ui/industrial-button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AiAssistantCard() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      if (!res.ok) throw new Error("AI error");
      const data = (await res.json()) as { suggestion: string };
      setResult(data.suggestion);
    } catch {
      setResult("Unable to generate suggestions right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border mb-8 shadow-sm">
          <Zap size={24} className="text-primary" />
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-foreground mb-6">
          Not sure what you need?
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
          Skip the manual sizing. Tell our engineering AI about your facility, and we&apos;ll instantly generate a compliant, phase-balanced equipment list.
        </p>

        {/* Massive interactive command bar */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative flex flex-col md:flex-row items-center bg-card border border-border rounded-2xl p-2 shadow-xl">
            <div className="flex-1 w-full flex items-center px-4 py-3 md:py-0">
              <div
                className={`w-2 h-2 rounded-full mr-4 shrink-0 shadow-[0_0_8px_rgba(255,102,0,0.8)] ${
                  loading ? "bg-primary animate-ping" : "bg-primary animate-pulse"
                }`}
              ></div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 500-bed hospital kitchen serving 3 meals a day..."
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 text-base md:text-lg cursor-text"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full md:w-auto mt-2 md:mt-0 whitespace-nowrap inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-sans text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-60"
            >
              {loading ? "Generating..." : <>Generate Loadout <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 text-left shadow-lg"
            >
              <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">
                AI Recommendation
              </p>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result}</div>
              <div className="mt-6 flex gap-3">
                <Link href="/catalog">
                  <IndustrialButton size="default">Browse Catalog</IndustrialButton>
                </Link>
                <IndustrialButton
                  variant="secondary"
                  size="default"
                  onClick={() => {
                    setResult(null);
                    setInput("");
                  }}
                >
                  Reset Search
                </IndustrialButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" /> Instant Calculation
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" /> Global Standards
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" /> Export to RFQ
          </span>
        </div>
      </motion.div>
    </section>
  );
}
