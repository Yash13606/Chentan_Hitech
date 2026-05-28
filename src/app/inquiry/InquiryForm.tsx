"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  submitInquiryAction,
  type InquiryFormState,
} from "@/server/actions/inquiry";

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────

const MESSAGE_MAX = 1000;
const COMPANY_BRAND = "Chetan Hi-Tech";

// ─────────────────────────────────────────────────────
// VALIDATORS (mirror server-side rules — UX rule #2)
// ─────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidName(v: string): boolean {
  return v.trim().length >= 2 && v.trim().length <= 80;
}
function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim()) && v.trim().length <= 120;
}
function isValidPhone(v: string): boolean {
  const digits = v.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

// Forgiving phone formatter — UX rule #6
// Strips formatting for display while preserving user's intent (leading +).
function displayPhone(v: string): string {
  return v;
}

// ─────────────────────────────────────────────────────
// FIELD COMPONENTS
// ─────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  error: string | null;
  touched: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
}

function Field({
  id,
  name,
  label,
  required,
  optional,
  type = "text",
  placeholder,
  autoComplete,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FieldProps) {
  const showError = touched && !!error;
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between mb-1.5"
      >
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-primary ml-0.5">*</span>}
        </span>
        {optional && (
          <span className="text-xs font-normal text-muted-foreground/80">
            optional
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? `${id}-error` : undefined}
        className={cn(
          "w-full border rounded-md bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2",
          showError
            ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
            : "border-border focus:ring-primary/20 focus:border-primary"
        )}
      />
      {showError && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SUBMIT BUTTON — disabled-until-valid, with reason (UX rule #1)
// ─────────────────────────────────────────────────────

function SubmitButton({
  canSubmit,
  missing,
}: {
  canSubmit: boolean;
  missing: string[];
}) {
  const { pending } = useFormStatus();
  const disabled = !canSubmit || pending;

  return (
    <div className="space-y-2">
      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "group w-full h-12 rounded-md text-base font-medium flex items-center justify-center gap-2 transition-all",
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:opacity-90"
        )}
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send inquiry
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {/* UX rule #1: tell the user *why* the button is grayed out */}
      {!canSubmit && missing.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {missing.length === 1
            ? `Missing: ${missing[0]}`
            : `Still needed: ${missing.join(", ")}`}
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground/80 pt-1">
        No commitment required. If we aren&rsquo;t a fit, we&rsquo;ll point you
        to someone who is.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN FORM
// ─────────────────────────────────────────────────────

type Prefill = {
  name: string;
  email: string;
  phone: string;
  company: string;
} | null;

export function InquiryForm({ prefill }: { prefill: Prefill }) {
  const [state, action] = useActionState<InquiryFormState, FormData>(
    submitInquiryAction,
    {}
  );

  // Pre-fill from session — UX rule #4
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [company, setCompany] = useState(prefill?.company ?? "");
  const [message, setMessage] = useState("");
  const [transactionalConsent, setTransactionalConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Inline validation state — UX rule #2
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  function touch(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  // Per-field client errors (live) — merged with server-returned errors after submit
  const clientErrors = useMemo(() => {
    return {
      name: name && !isValidName(name) ? "Please enter your full name" : null,
      email: email && !isValidEmail(email) ? "Enter a valid email address" : null,
      phone: phone && !isValidPhone(phone) ? "Enter a valid mobile number" : null,
      message:
        message.length > MESSAGE_MAX
          ? `Message must be under ${MESSAGE_MAX} characters`
          : null,
    };
  }, [name, email, phone, message]);

  const serverErrors = state.fieldErrors ?? {};

  function errorFor(field: "name" | "email" | "phone" | "message"): string | null {
    return clientErrors[field] ?? serverErrors[field] ?? null;
  }

  // Required fields filled + no errors anywhere → can submit (UX rule #1)
  const missing: string[] = [];
  if (!isValidName(name)) missing.push("Name");
  if (!isValidEmail(email)) missing.push("Email");
  if (!isValidPhone(phone)) missing.push("Mobile number");
  if (!transactionalConsent) missing.push("Transactional consent");
  if (clientErrors.message) missing.push("Shorter message");

  const canSubmit = missing.length === 0;

  // Scroll to top on success so confirmation is visible
  useEffect(() => {
    if (state.inquiryNumber) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.inquiryNumber]);

  // ── Success state ─────────────────────────────────────
  if (state.inquiryNumber) {
    return (
      <div className="border border-border rounded-md bg-card p-8">
        <div className="flex items-start gap-3 mb-5">
          <CheckCircle2
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#27a644" }}
          />
          <div>
            <h2 className="font-heading font-medium text-xl text-foreground">
              We&rsquo;ve got your inquiry
            </h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              We&rsquo;ll reach out within 10 minutes during business hours. A
              confirmation is on its way to your inbox.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-md px-4 py-3 mb-6">
          <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
            Reference
          </p>
          <p className="font-mono font-medium text-foreground text-base mt-0.5">
            {state.inquiryNumber}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/catalog"
            className="flex-1 h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Browse catalog
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="flex-1 h-11 rounded-md border border-border bg-background text-foreground text-sm font-medium flex items-center justify-center hover:bg-muted/40 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────
  return (
    <form
      action={action}
      noValidate
      className="border border-border rounded-md bg-card p-6 sm:p-8"
    >
      {/* Global server error */}
      {state.error && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive leading-relaxed">{state.error}</p>
        </div>
      )}

      <div className="space-y-5">
        <Field
          id="name"
          name="name"
          label="Name"
          required
          placeholder="Your name"
          autoComplete="name"
          value={name}
          touched={touched.name}
          error={errorFor("name")}
          onChange={setName}
          onBlur={() => touch("name")}
        />

        <Field
          id="email"
          name="email"
          label="Email"
          required
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          touched={touched.email}
          error={errorFor("email")}
          onChange={setEmail}
          onBlur={() => touch("email")}
        />

        <Field
          id="phone"
          name="phone"
          label="Mobile number"
          required
          type="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          value={displayPhone(phone)}
          touched={touched.phone}
          error={errorFor("phone")}
          onChange={setPhone}
          onBlur={() => touch("phone")}
        />

        <Field
          id="company"
          name="company"
          label="Company"
          optional
          placeholder="Company or project"
          autoComplete="organization"
          value={company}
          touched={false}
          error={null}
          onChange={setCompany}
          onBlur={() => {}}
        />

        {/* Message with character counter — UX rule #3 */}
        <div>
          <label
            htmlFor="message"
            className="flex items-baseline justify-between mb-1.5"
          >
            <span className="text-sm font-medium text-foreground">Message</span>
            <span className="text-xs font-normal text-muted-foreground/80">
              optional
            </span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={MESSAGE_MAX}
            placeholder="What do you want to build? Timeline, goals, or just say hello."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => touch("message")}
            aria-invalid={touched.message && !!errorFor("message") || undefined}
            className={cn(
              "w-full border rounded-md bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 resize-none leading-relaxed",
              touched.message && errorFor("message")
                ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                : "border-border focus:ring-primary/20 focus:border-primary"
            )}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {touched.message && errorFor("message") ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errorFor("message")}
              </p>
            ) : (
              <span />
            )}
            <span
              className={cn(
                "text-xs font-mono tabular-nums",
                message.length > MESSAGE_MAX * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground/70"
              )}
            >
              {message.length} / {MESSAGE_MAX}
            </span>
          </div>
        </div>

        {/* Consent checkboxes */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="transactionalConsent"
              checked={transactionalConsent}
              onChange={(e) => setTransactionalConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-primary shrink-0"
              required
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Required.</span>{" "}
              By checking this box, I consent to receive non-marketing text
              messages from {COMPANY_BRAND} about my inquiry, quotation
              updates, appointment reminders, etc. Message frequency varies,
              message &amp; data rates may apply. Text HELP for assistance,
              reply STOP to opt out.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="marketingConsent"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-primary shrink-0"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              By checking this box, I consent to receive marketing and
              promotional messages including special offers, discounts, new
              product updates and more from {COMPANY_BRAND} at the phone number
              provided. Frequency may vary. Message &amp; data rates may apply.
              Text HELP for assistance, reply STOP to opt out.
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <SubmitButton canSubmit={canSubmit} missing={missing} />
        </div>
      </div>
    </form>
  );
}
