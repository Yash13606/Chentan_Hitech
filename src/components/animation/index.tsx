"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE },
  },
};

/**
 * Wraps a grid/list — staggers its direct children when scrolled into view.
 * Each child should be a <StaggerItem>.
 */
export function StaggerGrid({
  children,
  className,
  stagger = 0.07,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Pair with StaggerGrid — receives the stagger variant from its parent. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={ITEM_VARIANTS}>
      {children}
    </motion.div>
  );
}

/** Single element that fades + slides up when scrolled into view. */
export function FadeUp({
  children,
  className,
  delay = 0,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
