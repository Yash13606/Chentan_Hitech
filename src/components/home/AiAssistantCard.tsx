"use client";

import { useState } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { SectionHeader } from "./CategoryGrid";

/**
 * AI Requirement Assistant — quiet helper card that sits below the fold.
 * The hero is the brand statement; AI is a tool, not the pitch.
 *
 * Graceful degradation: the API route returns a friendly message
 * when ANTHROPIC_API_KEY is missing.
 */
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
    <section
      id="ai-assistant"
      className="px-6 py-20 md:py-24 max-w-6xl mx-auto"
    >
      <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          AI Requirement Assistant
        </div>

        <SectionHeader
          eyebrow=""
          title="Describe what you need. We'll suggest the right equipment."
          sub="Tell us about your kitchen, laundry or facility — covers, footprint, project brief. The assistant suggests a starting equipment list you can refine."
        />

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 200-cover hotel restaurant in Chennai, Indian + continental menu, central kitchen layout"
            className="w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Your input stays private. We never share project details.
            </p>
            <IndustrialButton
              type="submit"
              disabled={loading || !input.trim()}
              className="gap-2"
            >
              {loading ? "Generating…" : "Suggest equipment"}
              <ArrowUpRight className="w-4 h-4" />
            </IndustrialButton>
          </div>
        </form>

        {result && (
          <div className="mt-8 rounded-xl border border-border bg-background p-6 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </section>
  );
}
