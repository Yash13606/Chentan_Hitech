"use client";

import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  Package,
  Wrench,
} from "lucide-react";

import {
  requestConsultationAction,
  type ConsultationState,
} from "@/server/actions/consultations";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────

const CONSULTATION_TYPES = [
  {
    value: "PRODUCT_INQUIRY",
    label: "Product Inquiry",
    description: "Specs, availability, alternatives",
    Icon: Package,
  },
  {
    value: "SITE_VISIT",
    label: "Site Visit",
    description: "On-site assessment & layout",
    Icon: MapPin,
  },
  {
    value: "ENGINEERING",
    label: "Engineering",
    description: "Technical specs & installation",
    Icon: Wrench,
  },
  {
    value: "PROJECT_PLANNING",
    label: "Project Planning",
    description: "Full scope, phasing, timeline",
    Icon: ClipboardList,
  },
] as const;

const NOTES_MAX = 600;

// ─────────────────────────────────────────────────────
// TIME-SLOT HELPERS
// ─────────────────────────────────────────────────────

/**
 * Returns an ISO string trimmed to minutes in the LOCAL timezone, suitable
 * for a `datetime-local` input. We deliberately ignore UTC offsets so the
 * value the user sees matches what they get back when the page reloads.
 */
function localDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function nextSuggestions(): { label: string; value: string }[] {
  const now = new Date();

  const tomorrowAm = new Date(now);
  tomorrowAm.setDate(tomorrowAm.getDate() + 1);
  tomorrowAm.setHours(10, 0, 0, 0);

  const tomorrowPm = new Date(now);
  tomorrowPm.setDate(tomorrowPm.getDate() + 1);
  tomorrowPm.setHours(15, 0, 0, 0);

  // Next Monday (or today if today is Monday and it's pre-9am)
  const nextMon = new Date(now);
  const daysUntilMon = (8 - nextMon.getDay()) % 7 || 7;
  nextMon.setDate(nextMon.getDate() + daysUntilMon);
  nextMon.setHours(11, 0, 0, 0);

  return [
    { label: "Tomorrow 10:00", value: localDatetimeValue(tomorrowAm) },
    { label: "Tomorrow 15:00", value: localDatetimeValue(tomorrowPm) },
    { label: "Next Mon 11:00", value: localDatetimeValue(nextMon) },
  ];
}

// ─────────────────────────────────────────────────────
// SUBMIT BUTTON
// ─────────────────────────────────────────────────────

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-foreground text-background text-sm font-medium",
        "hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting…
        </>
      ) : (
        <>
          Request consultation
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────
// MAIN FORM
// ─────────────────────────────────────────────────────

export function ConsultationForm() {
  const [state, action] = useActionState<ConsultationState, FormData>(
    requestConsultationAction,
    {}
  );
  const [selected, setSelected] = useState<string>("PRODUCT_INQUIRY");
  const [slot, setSlot] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const slotRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => nextSuggestions(), []);

  if (state.success) {
    return (
      <div className="rounded-md border border-[#cfe6d4] bg-[#f2faf4] px-5 py-5 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#1a7530]" />
        <div>
          <p className="font-heading text-base font-medium text-foreground">
            Consultation requested
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Our team will review your request and confirm a slot within one
            business day. You&apos;ll receive an email with the meeting link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-7">
      {/* ── Consultation type ──────────────────────────────────── */}
      <fieldset>
        <legend className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground mb-3">
          Consultation type
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONSULTATION_TYPES.map(({ value, label, description, Icon }) => {
            const isSelected = selected === value;
            return (
              <label
                key={value}
                className={cn(
                  "group relative flex items-start gap-3 p-3.5 rounded-md border cursor-pointer select-none transition-all duration-150",
                  isSelected
                    ? "border-foreground bg-foreground/[0.03]"
                    : "border-border bg-background hover:border-foreground/30 hover:bg-foreground/[0.02]"
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={isSelected}
                  onChange={() => setSelected(value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-md grid place-items-center transition-colors",
                    isSelected
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground"
                  )}
                  aria-hidden
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground leading-tight">
                    {label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                    {description}
                  </span>
                </span>
                {/* Selection check dot */}
                <span
                  className={cn(
                    "absolute top-3 right-3 w-3.5 h-3.5 rounded-full border transition-all",
                    isSelected
                      ? "border-foreground bg-foreground"
                      : "border-border bg-background"
                  )}
                  aria-hidden
                >
                  {isSelected && (
                    <span className="absolute inset-[3px] rounded-full bg-background" />
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ── Date & time + quick picks ──────────────────────────── */}
      <div>
        <label
          htmlFor="requestedSlot"
          className="block text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground mb-3"
        >
          Preferred date &amp; time
        </label>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setSlot(s.value);
                slotRef.current?.focus();
              }}
              className={cn(
                "inline-flex items-center h-7 px-3 rounded-full text-xs font-medium transition-colors",
                slot === s.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <input
          id="requestedSlot"
          ref={slotRef}
          name="requestedSlot"
          type="datetime-local"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className={cn(
            "w-full sm:w-72 h-11 px-3 rounded-md bg-background border border-border",
            "text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-colors font-mono tabular-nums"
          )}
        />
      </div>

      {/* ── Notes ─────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="notes"
          className="flex items-baseline justify-between mb-3"
        >
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground">
            Notes
          </span>
          <span className="text-[11px] text-muted-foreground/70 normal-case tracking-normal">
            optional
          </span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={NOTES_MAX}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Facility type, equipment in mind, specific questions. The more context, the more useful the first call will be."
          className={cn(
            "w-full px-3 py-2.5 rounded-md bg-background border border-border",
            "text-sm text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-colors resize-none leading-relaxed"
          )}
        />
        <div className="mt-1.5 flex items-center justify-end">
          <span
            className={cn(
              "text-xs font-mono tabular-nums",
              notes.length > NOTES_MAX * 0.9
                ? "text-destructive"
                : "text-muted-foreground/70"
            )}
          >
            {notes.length} / {NOTES_MAX}
          </span>
        </div>
      </div>

      {state.error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-muted-foreground hidden sm:block max-w-xs leading-relaxed">
          We&apos;ll send a confirmation email with the meeting link once a
          specialist accepts the slot.
        </p>
        <SubmitBtn />
      </div>
    </form>
  );
}
