"use client";

import { Search, ShoppingCart, FileText } from "lucide-react";
import { BrowseAnimation, RFQAnimation, PDFAnimation } from "./HowItWorksAnimations";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeader } from "./CategoryGrid";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Browse and shortlist",
    description:
      "Filter the catalog by category, brand or industry. Compare specs side by side. Save bundles for projects in planning.",
  },
  {
    n: "02",
    icon: ShoppingCart,
    title: "Build your RFQ",
    description:
      "Add equipment to a cart, set quantities and project notes. Submit a single quotation request — no phone tag required.",
  },
  {
    n: "03",
    icon: FileText,
    title: "Receive a branded PDF",
    description:
      "Sales reviews your inquiry, configures pricing, and sends a branded PDF quotation with valid-until dates and terms.",
  },
] as const;

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section className="px-6 py-20 md:py-28 max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="How it works"
        title="From shortlist to quotation in three steps"
        sub="No payment gateway, no hidden pricing tricks — just a clean RFQ flow that replaces phone calls and email chains."
      />

      <div ref={sectionRef} className="mt-14 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className={`relative ${i < STEPS.length - 1 ? "pb-10 md:pb-0 border-b md:border-b-0 border-border" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.1 + i * 0.14 }}
            >
              {/* Connector line to next step — desktop only */}
              {i < 2 && (
                <div
                  className="hidden md:block absolute top-5 h-px overflow-hidden pointer-events-none"
                  style={{ left: "40px", right: "-32px" }}
                >
                  <motion.div
                    className="h-full bg-border"
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{
                      duration: 0.9,
                      ease: EASE,
                      delay: 0.35 + i * 0.18,
                    }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              )}

              {/* Icon circle */}
              <motion.div
                className="relative z-10 w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center mb-7"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.08 + i * 0.14 }}
              >
                <step.icon
                  className="w-[17px] h-[17px] text-foreground"
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Step label */}
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground/50 mb-2.5">
                Step {step.n}
              </p>

              {/* Title */}
              <h3 className="font-heading text-xl font-medium text-foreground leading-snug mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Step illustration */}
              <div className="mt-5">
                {i === 0 && <BrowseAnimation />}
                {i === 1 && <RFQAnimation />}
                {i === 2 && <PDFAnimation />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
