"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/server/actions/auth";
import Link from "next/link";

const INDUSTRIES = [
  { value: "HOSPITALITY", label: "Hospitality & Hotels" },
  { value: "RESTAURANT", label: "Restaurant & Cloud Kitchens" },
  { value: "HEALTHCARE", label: "Healthcare & Hospitals" },
  { value: "DEFENCE", label: "Defence & Canteens" },
  { value: "MARINE", label: "Marine & Shipyard" },
  { value: "LAUNDRY", label: "Industrial Laundry" },
  { value: "EDUCATION", label: "Education & Institutions" },
  { value: "CORPORATE", label: "Corporate Campuses" },
  { value: "OTHER", label: "Other" },
];

const ORG_SIZES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "500+", label: "500+ employees" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground font-sans font-medium text-sm py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Creating account…" : "Create Account & Request Access"}
    </button>
  );
}

export default function SignupPage() {
  const [state, action] = useActionState(signupAction, {});

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-heading font-medium text-2xl text-foreground">
              Chetan Hi-Tech
            </span>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Industrial Equipment Procurement
          </p>
        </div>

        <div className="border border-border rounded-md bg-card p-8">
          <div className="mb-6">
            <h1 className="font-heading font-medium text-xl text-foreground">
              Request access
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pricing, quotations, and full catalog visibility unlock after
              registration.
            </p>
          </div>

          {/* Global error */}
          {state.error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2 mb-4">
              {state.error}
            </p>
          )}

          <form action={action} className="space-y-5">
            {/* Personal */}
            <fieldset>
              <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Your details
              </legend>
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Raj Mehta"
                  />
                  {state.fieldErrors?.name && (
                    <p className="text-xs text-destructive mt-1">{state.fieldErrors.name[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Work email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="raj@tajhotels.com"
                  />
                  {state.fieldErrors?.email && (
                    <p className="text-xs text-destructive mt-1">{state.fieldErrors.email[0]}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    {state.fieldErrors?.password && (
                      <p className="text-xs text-destructive mt-1">{state.fieldErrors.password[0]}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                      Phone <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Company */}
            <fieldset>
              <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Organisation details
              </legend>
              <div className="space-y-3">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1">
                    Company name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Taj Hotels Ltd."
                  />
                  {state.fieldErrors?.companyName && (
                    <p className="text-xs text-destructive mt-1">{state.fieldErrors.companyName[0]}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-1">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      required
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">Select…</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="orgSize" className="block text-sm font-medium text-foreground mb-1">
                      Organisation size
                    </label>
                    <select
                      id="orgSize"
                      name="orgSize"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">Select…</option>
                      {ORG_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <SubmitButton />

            <p className="text-xs text-muted-foreground text-center">
              By registering, you agree to receive commercial quotations from Chetan Hi-Tech.
              No spam. No checkout. Pricing is always shared via formal quotation.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
