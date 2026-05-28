"use client";

import { useState, useRef } from "react";
import { Sparkles, ArrowUpRight, RotateCcw } from "lucide-react";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { motion, useInView, AnimatePresence } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AiAssistantCard() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

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

  const handleReset = () => {
    setResult(null);
    setInput("");
  };

  return (
    <section id="ai-assistant" className="bg-foreground">
      <motion.div
        ref={sectionRef}
        className="px-6 py-20 md:py-28 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-background/45 mb-10 md:mb-12">
          <Sparkles className="w-3 h-3 text-primary" strokeWidth={1.5} />
          AI Requirement Assistant
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-[5fr_7fr] gap-10 md:gap-16 items-start">
          {/* Left: copy */}
          <div>
            <h2 className="font-heading font-medium text-[1.75rem] md:text-[2.1rem] text-background leading-tight tracking-tight">
              Describe what you need. We&apos;ll suggest the right equipment.
            </h2>
            <p className="mt-4 text-sm text-background/55 leading-relaxed">
              Tell us about your kitchen, laundry or facility — covers,
              footprint, project brief. The assistant suggests a starting
              equipment list you can refine.
            </p>
            <div className="mt-8 flex items-center gap-3 text-xs text-background/35">
              <span className="block w-5 h-px bg-background/20 shrink-0" />
              Your input stays private. We never share project details.
            </div>
          </div>

          {/* Right: form / result */}
          <div>
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. 200-cover hotel restaurant in Chennai, Indian + continental menu, central kitchen layout"
                    rows={5}
                    className="w-full rounded-xl bg-background/[0.07] border border-background/[0.14] px-4 py-3.5
                               text-sm text-background placeholder:text-background/28 leading-relaxed
                               focus:outline-none focus:border-primary/50 focus:bg-background/[0.11]
                               transition-colors resize-none"
                  />

                  <div className="flex items-center justify-end">
                    <IndustrialButton
                      type="submit"
                      variant="inverse"
                      size="default"
                      disabled={loading || !input.trim()}
                      className="gap-2.5 min-w-[170px] justify-center"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          Analysing
                          <span className="flex items-center gap-[3px]">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-[3px] h-[3px] rounded-full bg-current animate-bounce"
                                style={{ animationDelay: `${i * 0.12}s` }}
                              />
                            ))}
                          </span>
                        </span>
                      ) : (
                        <>
                          Suggest equipment
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </IndustrialButton>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className="rounded-xl bg-background/[0.07] border border-background/[0.14] p-6">
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-background/40 mb-4">
                      Suggested starting list
                    </p>
                    <div className="text-sm text-background/80 leading-relaxed whitespace-pre-wrap">
                      {result}
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="mt-4 flex items-center gap-1.5 text-xs text-background/35 hover:text-background/65 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Start a new request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
