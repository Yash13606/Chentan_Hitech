"use client";

import { useActionState } from "react";
import { CheckCircle } from "lucide-react";
import {
  requestConsultationAction,
  type ConsultationState,
} from "@/server/actions/consultations";
import { useFormStatus } from "react-dom";

const CONSULTATION_TYPES = [
  { value: "PRODUCT_INQUIRY", label: "Product Inquiry" },
  { value: "SITE_VISIT", label: "Site Visit" },
  { value: "ENGINEERING", label: "Engineering Consultation" },
  { value: "PROJECT_PLANNING", label: "Project Planning" },
];

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Submitting…" : "Request Consultation"}
    </button>
  );
}

export function ConsultationForm() {
  const [state, action] = useActionState<ConsultationState, FormData>(
    requestConsultationAction,
    {}
  );

  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-green-700 text-sm">
        <CheckCircle className="w-4 h-4 shrink-0" />
        Consultation requested. Our team will confirm your slot within 24 hours.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Consultation Type
          </label>
          <select
            name="type"
            className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {CONSULTATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Preferred Date & Time
          </label>
          <input
            name="requestedSlot"
            type="datetime-local"
            className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Describe your project or specific questions…"
          className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <SubmitBtn />
    </form>
  );
}
