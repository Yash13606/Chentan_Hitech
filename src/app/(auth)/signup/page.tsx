"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/server/actions/auth";
import Link from "next/link";
import { signupSchema } from "@/server/validators/auth";
import { AlertCircle, Check, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

function displayPhone(v: string): string {
  return v;
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs whitespace-nowrap", met ? "text-green-600" : "text-muted-foreground")}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
      <span className={met ? "font-medium" : ""}>{text}</span>
    </div>
  );
}

function SubmitButton({ isValid, missingFields }: { isValid: boolean; missingFields: string[] }) {
  const { pending } = useFormStatus();
  const disabled = !isValid || pending;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-xs text-muted-foreground md:max-w-sm text-center md:text-left leading-relaxed">
        By registering, you agree to receive commercial quotations from Chetan Hi-Tech. 
        No spam. Pricing is always shared via formal quotation.
      </div>
      
      <div className="flex flex-col items-center md:items-end w-full md:w-auto">
        <button
          type="submit"
          disabled={disabled}
          className={cn(
            "w-full md:w-auto font-sans font-medium text-sm py-2.5 px-8 rounded-md transition-all",
            disabled
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {pending ? "Creating account…" : "Create Account"}
        </button>
        {!isValid && missingFields.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Still needed: {missingFields.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [state, action] = useActionState(signupAction, {});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    industry: "",
    orgSize: "",
    city: "",
    state: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validation = useMemo(() => {
    return signupSchema.safeParse(form);
  }, [form]);

  const clientErrors = !validation.success ? validation.error.flatten().fieldErrors : {};
  const serverErrors = state.fieldErrors ?? {};

  const errorFor = (field: string) => {
    return (clientErrors[field as keyof typeof clientErrors]?.[0]) ?? serverErrors[field]?.[0] ?? null;
  };

  const showError = (field: string) => touched[field] && !!errorFor(field);

  const missingFields: string[] = [];
  if (!form.name || clientErrors.name) missingFields.push("Name");
  if (!form.email || clientErrors.email) missingFields.push("Email");
  if (!form.password || clientErrors.password) missingFields.push("Password");
  if (!form.phone || clientErrors.phone) missingFields.push("Phone");
  if (!form.companyName || clientErrors.companyName) missingFields.push("Company");
  if (!form.industry || clientErrors.industry) missingFields.push("Industry");

  const isValid = missingFields.length === 0;

  const pw = form.password;
  const pwReqs = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="mb-6 text-center w-full flex flex-col md:flex-row md:justify-between md:items-end">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-block">
              <span className="font-heading font-medium text-2xl text-foreground">
                Chetan Hi-Tech
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mt-0.5">
              Industrial Equipment Procurement
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0 text-center md:text-right">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full border border-border rounded-xl bg-card p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading font-medium text-xl text-foreground">
                Request access
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pricing, quotations, and full catalog visibility unlock after registration.
              </p>
            </div>
            
            {/* Global error (e.g. Account already exists) */}
            {state.error && (
              <div className="mt-4 md:mt-0 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 max-w-sm">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">{state.error}</p>
              </div>
            )}
          </div>

          <form action={action} noValidate className="flex flex-col">
            {/* Grid Layout for Desktop: 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Left Column: Personal Details */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-4 border-b border-border/50 pb-1 w-full">
                  Your details
                </legend>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1 md:col-span-2">
                    <label htmlFor="name" className="block text-xs font-medium text-foreground mb-1">
                      Full name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => touch("name")}
                      className={cn(
                        "w-full border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors",
                        showError("name")
                          ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                          : "border-border focus:ring-primary/30 focus:border-primary"
                      )}
                      placeholder="Raj Mehta"
                    />
                    {showError("name") && (
                      <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errorFor("name")}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1 md:col-span-2">
                    <label htmlFor="phone" className="block text-xs font-medium text-foreground mb-1">
                      Phone <span className="text-primary">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={displayPhone(form.phone)}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => touch("phone")}
                      className={cn(
                        "w-full border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors",
                        showError("phone")
                          ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                          : "border-border focus:ring-primary/30 focus:border-primary"
                      )}
                      placeholder="+91 98765 43210"
                    />
                    {showError("phone") && (
                      <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errorFor("phone")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1">
                    Work email <span className="text-primary">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => touch("email")}
                    className={cn(
                      "w-full border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors",
                      showError("email")
                        ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                        : "border-border focus:ring-primary/30 focus:border-primary"
                    )}
                    placeholder="raj@tajhotels.com"
                  />
                  {showError("email") && (
                    <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errorFor("email")}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1">
                    Password <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => touch("password")}
                      className={cn(
                        "w-full border rounded-md bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors",
                        showError("password")
                          ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                          : "border-border focus:ring-primary/30 focus:border-primary"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Single Line Password Checklist */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 bg-muted/30 p-2.5 rounded-md border border-border/50">
                    <PasswordRequirement met={pwReqs.length} text="8+ chars" />
                    <PasswordRequirement met={pwReqs.upper} text="1 uppercase" />
                    <PasswordRequirement met={pwReqs.number} text="1 number" />
                    <PasswordRequirement met={pwReqs.special} text="1 special" />
                  </div>
                </div>
              </fieldset>

              {/* Right Column: Organisation Details */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-4 border-b border-border/50 pb-1 w-full">
                  Organisation details
                </legend>
                
                <div>
                  <label htmlFor="companyName" className="block text-xs font-medium text-foreground mb-1">
                    Company name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    onBlur={() => touch("companyName")}
                    className={cn(
                      "w-full border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors",
                      showError("companyName")
                        ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                        : "border-border focus:ring-primary/30 focus:border-primary"
                    )}
                    placeholder="Taj Hotels Ltd."
                  />
                  {showError("companyName") && (
                    <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errorFor("companyName")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className="block text-xs font-medium text-foreground mb-1">
                      Industry <span className="text-primary">*</span>
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      required
                      value={form.industry}
                      onChange={(e) => handleChange("industry", e.target.value)}
                      onBlur={() => touch("industry")}
                      className={cn(
                        "w-full border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors",
                        showError("industry")
                          ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                          : "border-border focus:ring-primary/30 focus:border-primary"
                      )}
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
                    <label htmlFor="orgSize" className="block text-xs font-medium text-foreground mb-1">
                      Organisation size
                    </label>
                    <select
                      id="orgSize"
                      name="orgSize"
                      value={form.orgSize}
                      onChange={(e) => handleChange("orgSize", e.target.value)}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-medium text-foreground mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-xs font-medium text-foreground mb-1">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Submit Area */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <SubmitButton isValid={isValid} missingFields={missingFields} />
            </div>
            
          </form>
        </div>
      </div>
    </main>
  );
}
