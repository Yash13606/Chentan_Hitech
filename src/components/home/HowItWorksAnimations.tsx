"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// ── Shared cursor ────────────────────────────────────────────────────────
type CP = { x: number; y: number };

function Cursor({ pos, clicking }: { pos: CP; clicking: boolean }) {
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{ top: 0, left: 0 }}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: 0.52, ease: EASE }}
    >
      <motion.svg
        width="13" height="16" viewBox="0 0 13 16" fill="none"
        animate={{ scale: clicking ? 0.68 : 1 }}
        transition={{ duration: 0.1 }}
      >
        <path
          d="M1 1L1 12L3.8 9.5L6 15L7.5 14.3L5.3 8.8H10.5L1 1Z"
          fill="white"
          stroke="#1c1917"
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 1: Browse & Shortlist
// Style: Browser chrome (traffic-light dots) + filter chips + colored swatches
// Cursor: clicks Hospitality filter → hovers product → clicks Add
// ═══════════════════════════════════════════════════════════════════════════

const B_ITEMS = [
  { name: "Dishwasher",       swatch: "bg-sky-300/70" },
  { name: "Walk-in Chiller",  swatch: "bg-emerald-300/70" },
  { name: "Combi Oven",       swatch: "bg-orange-300/70" },
];

// Positions for ~340px wide container
const BP = {
  idle:  { x: 50,  y: 95 },
  hosp:  { x: 81,  y: 16 },
  add0:  { x: 296, y: 52 },
  cart:  { x: 318, y: 16 },
};

export function BrowseAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [cycle, setCycle] = useState(0);
  const [pos, setPos] = useState<CP>(BP.idle);
  const [clicking, setClicking] = useState(false);
  const [filter, setFilter] = useState(0);
  const [visible, setVisible] = useState(0);
  const [hovered, setHovered] = useState(-1);
  const [cart, setCart] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dead = { v: false };
    const click = async () => {
      setClicking(true); await wait(140); if (!dead.v) setClicking(false);
    };
    (async () => {
      setPos(BP.idle); setFilter(0); setVisible(0); setHovered(-1); setCart(0); setClicking(false);
      await wait(520); if (dead.v) return;
      // Products slide in one by one
      setVisible(1); await wait(170); if (dead.v) return;
      setVisible(2); await wait(170); if (dead.v) return;
      setVisible(3); await wait(550); if (dead.v) return;
      // Cursor moves to "Hospitality" filter
      setPos(BP.hosp); await wait(650); if (dead.v) return;
      await click(); setFilter(1); await wait(850); if (dead.v) return;
      // Row 0 highlights, cursor moves to Add button
      setHovered(0); setPos(BP.add0); await wait(700); if (dead.v) return;
      // Click Add → cart badge pops
      await click(); setCart(1); await wait(420); if (dead.v) return;
      // Cursor drifts to cart
      setHovered(-1); setPos(BP.cart); await wait(750); if (dead.v) return;
      await wait(1600); if (dead.v) return;
      setCycle((c) => c + 1);
    })();
    return () => { dead.v = true; };
  }, [inView, cycle]);

  return (
    <div
      ref={ref}
      className="relative w-full h-[190px] rounded-xl border border-border bg-card overflow-hidden flex flex-col select-none pointer-events-none"
    >
      <Cursor pos={pos} clicking={clicking} />

      {/* Browser chrome bar */}
      <div className="flex items-center gap-1.5 px-3 py-[7px] border-b border-border bg-background/50 shrink-0">
        {/* Traffic-light dots */}
        <div className="flex gap-1 mr-2 shrink-0">
          <div className="w-[7px] h-[7px] rounded-full bg-rose-400/60" />
          <div className="w-[7px] h-[7px] rounded-full bg-amber-400/60" />
          <div className="w-[7px] h-[7px] rounded-full bg-emerald-400/60" />
        </div>
        {/* Filter chips */}
        {["All", "Hospitality", "Healthcare"].map((f, i) => (
          <span
            key={f}
            className={`px-2 py-[2px] rounded-full text-[7.5px] font-medium border transition-all duration-350 ${
              filter === i
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground border-border"
            }`}
          >
            {f}
          </span>
        ))}
        {/* Cart icon + badge */}
        <div className="ml-auto relative w-5 h-5 flex items-center justify-center shrink-0">
          <span className="text-[11px]">🛒</span>
          <AnimatePresence>
            {cart > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute -top-[3px] -right-[3px] w-[13px] h-[13px] rounded-full bg-primary text-primary-foreground text-[6.5px] flex items-center justify-center font-bold leading-none"
              >
                {cart}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 flex flex-col px-3 pt-2 gap-[3px] overflow-hidden">
        {B_ITEMS.map((item, i) => (
          <div key={item.name} className="h-7 relative overflow-hidden">
            <AnimatePresence>
              {visible > i && (
                <motion.div
                  key="row"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.34, ease: EASE }}
                  className={`absolute inset-0 flex items-center justify-between rounded-md px-2 transition-colors duration-300 ${
                    hovered === i ? "bg-muted/70" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-[14px] h-[14px] rounded-sm ${item.swatch} shrink-0`} />
                    <span className="text-[9px] text-foreground">{item.name}</span>
                  </div>
                  <motion.span
                    animate={{ opacity: hovered === i ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[7px] px-[6px] py-[2px] rounded bg-primary text-primary-foreground font-semibold"
                  >
                    + Add
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 2: Build your RFQ
// Style: Structured form — RFQ tag header, qty steppers (− / n / +)
// Cursor: clicks + on two items → clicks submit → "Submitted ✓"
// ═══════════════════════════════════════════════════════════════════════════

const R_ITEMS = [
  { name: "Dishwasher" },
  { name: "Walk-in Chiller" },
  { name: "Combi Oven" },
];

const RP = {
  idle:   { x: 80,  y: 100 },
  plus0:  { x: 314, y: 52 },
  plus1:  { x: 314, y: 82 },
  submit: { x: 170, y: 164 },
};

export function RFQAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [cycle, setCycle] = useState(0);
  const [pos, setPos] = useState<CP>(RP.idle);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(0);
  const [qtys, setQtys] = useState([1, 1, 2]);
  const [plusActive, setPlusActive] = useState(-1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const dead = { v: false };
    const click = async () => {
      setClicking(true); await wait(140); if (!dead.v) setClicking(false);
    };
    (async () => {
      setPos(RP.idle); setQtys([1, 1, 2]); setVisible(0); setPlusActive(-1); setSubmitted(false); setClicking(false);
      await wait(420); if (dead.v) return;
      // Items slide up into view
      setVisible(1); await wait(190); if (dead.v) return;
      setVisible(2); await wait(190); if (dead.v) return;
      setVisible(3); await wait(580); if (dead.v) return;
      // Cursor to + on item 0, click increments qty
      setPos(RP.plus0); await wait(640); if (dead.v) return;
      setPlusActive(0); await click(); if (dead.v) return;
      setPlusActive(-1); setQtys((q) => { const n = [...q]; n[0]++; return n; });
      await wait(540); if (dead.v) return;
      // Cursor to + on item 1
      setPos(RP.plus1); await wait(580); if (dead.v) return;
      setPlusActive(1); await click(); if (dead.v) return;
      setPlusActive(-1); setQtys((q) => { const n = [...q]; n[1]++; return n; });
      await wait(540); if (dead.v) return;
      // Cursor moves to submit button
      setPos(RP.submit); await wait(680); if (dead.v) return;
      await click(); setSubmitted(true); await wait(1800); if (dead.v) return;
      setCycle((c) => c + 1);
    })();
    return () => { dead.v = true; };
  }, [inView, cycle]);

  return (
    <div
      ref={ref}
      className="relative w-full h-[190px] rounded-xl border border-border bg-card overflow-hidden flex flex-col select-none pointer-events-none"
    >
      <Cursor pos={pos} clicking={clicking} />

      {/* Header: RFQ badge + title + progress */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-[22px] h-[14px] rounded-[3px] bg-foreground flex items-center justify-center shrink-0">
            <span className="text-background text-[6px] font-bold font-mono tracking-wider">RFQ</span>
          </div>
          <span className="text-[9px] font-medium text-foreground">Build Request</span>
        </div>
        <span className="font-mono text-[7.5px] text-muted-foreground">
          {visible > 0 ? `${visible}/3 items` : ""}
        </span>
      </div>

      {/* Items with qty steppers */}
      <div className="flex-1 flex flex-col px-3 pt-2 gap-[4px] overflow-hidden">
        {R_ITEMS.map((item, i) => (
          <div key={item.name} className="h-7 relative overflow-hidden">
            <AnimatePresence>
              {visible > i && (
                <motion.div
                  key="item"
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.34, ease: EASE }}
                  className="absolute inset-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-[3px] h-[16px] rounded-full bg-muted-foreground/25 shrink-0" />
                    <span className="text-[9px] text-foreground">{item.name}</span>
                  </div>
                  {/* −  qty  + stepper */}
                  <div className="flex items-center gap-[3px] shrink-0">
                    <div className="w-[14px] h-[14px] rounded-[3px] border border-border flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground leading-none select-none">−</span>
                    </div>
                    <div className="w-[18px] h-[14px] rounded-[3px] border border-border flex items-center justify-center overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={qtys[i]}
                          initial={{ y: -7, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 7, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="absolute font-mono text-[8px] text-foreground leading-none"
                        >
                          {qtys[i]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div
                      className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-all duration-150 ${
                        plusActive === i
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      <span
                        className={`text-[10px] leading-none font-medium select-none transition-colors duration-150 ${
                          plusActive === i ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        +
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Submit / confirmed */}
      <div className="px-3 pb-3 shrink-0">
        <AnimatePresence mode="wait">
          {visible >= 3 && !submitted && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full rounded-md py-[6px] bg-foreground text-background text-center text-[8.5px] font-medium"
            >
              Get Quotation Now →
            </motion.div>
          )}
          {submitted && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="w-full rounded-md py-[6px] bg-primary text-primary-foreground text-center text-[8.5px] font-medium"
            >
              ✓ Quotation Submitted
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 3: Receive a branded PDF
// Style: Document header + animated status ping → line items → cursor downloads
// Cursor: moves to Download → clicks → "PDF Downloaded ✓"
// ═══════════════════════════════════════════════════════════════════════════

const P_ITEMS = [
  { name: "Dishwasher",      price: "₹48,500" },
  { name: "Walk-in Chiller", price: "₹1,20,000" },
  { name: "Combi Oven",      price: "₹67,200" },
];

const PP = {
  idle:     { x: 80,  y: 75 },
  download: { x: 170, y: 163 },
};

export function PDFAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [cycle, setCycle] = useState(0);
  const [pos, setPos] = useState<CP>(PP.idle);
  const [clicking, setClicking] = useState(false);
  const [status, setStatus] = useState<"reviewing" | "ready">("reviewing");
  const [ping, setPing] = useState(false);
  const [visible, setVisible] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const dead = { v: false };
    const click = async () => {
      setClicking(true); await wait(140); if (!dead.v) setClicking(false);
    };
    (async () => {
      setPos(PP.idle); setStatus("reviewing"); setPing(false); setVisible(0);
      setShowTotal(false); setDownloaded(false); setClicking(false);
      await wait(650); if (dead.v) return;
      // Status changes — ping ripple fires
      setStatus("ready"); setPing(true);
      await wait(800); if (dead.v) return;
      setPing(false);
      // Line items appear
      setVisible(1); await wait(210); if (dead.v) return;
      setVisible(2); await wait(210); if (dead.v) return;
      setVisible(3); await wait(320); if (dead.v) return;
      setShowTotal(true); await wait(480); if (dead.v) return;
      // Cursor moves to Download
      setPos(PP.download); await wait(700); if (dead.v) return;
      // Click → downloaded state
      await click(); setDownloaded(true); await wait(1700); if (dead.v) return;
      setCycle((c) => c + 1);
    })();
    return () => { dead.v = true; };
  }, [inView, cycle]);

  return (
    <div
      ref={ref}
      className="relative w-full h-[190px] rounded-xl border border-border bg-card overflow-hidden flex flex-col select-none pointer-events-none"
    >
      <Cursor pos={pos} clicking={clicking} />

      {/* Document header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Tiny doc icon */}
          <div className="w-[13px] h-[15px] rounded-[2px] border border-muted-foreground/30 flex flex-col items-center justify-center gap-[2px] shrink-0">
            <div className="w-[8px] h-[1px] bg-muted-foreground/40 rounded" />
            <div className="w-[8px] h-[1px] bg-muted-foreground/40 rounded" />
            <div className="w-[5px] h-[1px] bg-muted-foreground/40 rounded" />
          </div>
          <span className="font-mono text-[8px] text-muted-foreground">QT-2024-0891</span>
        </div>
        {/* Status badge with ping ripple */}
        <div className="flex items-center gap-1">
          <div className="relative w-[9px] h-[9px] flex items-center justify-center shrink-0">
            {ping && (
              <motion.div
                className="absolute inset-[-4px] rounded-full bg-emerald-400"
                initial={{ scale: 0.6, opacity: 0.7 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              />
            )}
            <div
              className={`w-[7px] h-[7px] rounded-full transition-colors duration-500 ${
                status === "ready" ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
          </div>
          <span
            className={`text-[8px] font-medium transition-colors duration-500 ${
              status === "ready" ? "text-emerald-600" : "text-amber-500"
            }`}
          >
            {status === "ready" ? "Quotation Ready" : "Under Review"}
          </span>
        </div>
      </div>

      {/* Line items */}
      <div className="flex-1 flex flex-col px-3 pt-2 gap-[3px] overflow-hidden">
        {P_ITEMS.map((item, i) => (
          <div key={item.name} className="h-5 relative overflow-hidden">
            <AnimatePresence>
              {visible > i && (
                <motion.div
                  key="line"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="absolute inset-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    {/* Left accent bar */}
                    <div className="w-[2px] h-[12px] rounded-full bg-primary/40 shrink-0" />
                    <span className="text-[8.5px] text-foreground">{item.name}</span>
                  </div>
                  <span className="font-mono text-[8.5px] text-foreground">{item.price}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Total row */}
        <AnimatePresence>
          {showTotal && (
            <motion.div
              key="total"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
              className="mt-0.5 pt-1.5 border-t border-border flex items-center justify-between"
            >
              <span className="text-[8.5px] font-semibold text-foreground">Total</span>
              <span className="font-mono text-[8.5px] font-semibold text-foreground">₹2,35,700</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Download button */}
      <div className="px-3 pb-3 shrink-0">
        <AnimatePresence mode="wait">
          {showTotal && !downloaded && (
            <motion.div
              key="dl"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full rounded-md py-[6px] bg-foreground text-background text-center text-[8.5px] font-medium"
            >
              ↓ Download PDF
            </motion.div>
          )}
          {downloaded && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="w-full rounded-md py-[6px] bg-emerald-600 text-white text-center text-[8.5px] font-medium"
            >
              ✓ PDF Downloaded
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
