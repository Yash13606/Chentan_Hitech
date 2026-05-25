"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Package, MapPin, Wrench, ClipboardList } from "lucide-react";
import {
  requestConsultationAction,
  type ConsultationState,
} from "@/server/actions/consultations";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { cn } from "@/lib/utils";

const CONSULTATION_TYPES = [
  {
    value: "PRODUCT_INQUIRY",
    label: "Product Inquiry",
    description: "Equipment specs & availability",
    Icon: Package,
  },
  {
    value: "SITE_VISIT",
    label: "Site Visit",
    description: "On-site assessment & layout planning",
    Icon: MapPin,
  },
  {
    value: "ENGINEERING",
    label: "Engineering Consultation",
    description: "Technical specs & installation",
    Icon: Wrench,
  },
  {
    value: "PROJECT_PLANNING",
    label: "Project Planning",
    description: "Full project scope & timeline",
    Icon: ClipboardList,
  },
];

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <IndustrialButton
      type="submit"
      disabled={pending}
      variant="primary"
      size="default"
    >
      {pending ? "Submitting…" : "Request Consultation"}
    </IndustrialButton>
  );
}

export function ConsultationForm() {
  const [state, action] = useActionState<ConsultationState, FormData>(
    requestConsultationAction,
    {}
  );
  const [selected, setSelected] = useState("PRODUCT_INQUIRY");

  if (state.success) {
    return (
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: "#c8e8d0", backgroundColor: "#f2faf4" }}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#27a644" }}
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              Consultation Requested
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Our team will review your request and confirm a slot within one
              business day.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {/* Type selector */}
      <div>
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-3">
          Consultation Type
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONSULTATION_TYPES.map(({ value, label, description, Icon }) => (
            <label
              key={value}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none",
                selected === value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-ring hover:bg-muted/40"
              )}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={selected === value}
                onChange={() => setSelected(value)}
                className="sr-only"
              />
              <Icon
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                  selected === value ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium leading-snug",
                    selected === value ? "text-foreground" : "text-foreground"
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Date & time */}
      <div>
        <label
          htmlFor="requestedSlot"
          className="block text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2"
        >
          Preferred Date & Time
        </label>
        <input
          id="requestedSlot"
          name="requestedSlot"
          type="datetime-local"
          className="w-full sm:w-72 border border-border rounded-xl bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2"
        >
          Notes{" "}
          <span className="normal-case font-normal tracking-normal text-muted-foreground/70">
            (optional)
          </span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Describe your facility type, the equipment you have in mind, or any specific questions. The more context you provide, the more useful our first session will be."
          className="w-full border border-border rounded-xl bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none leading-relaxed"
        />
      </div>

      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <SubmitBtn />
    </form>
  );
}
