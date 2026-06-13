"use client";

import { useActionState, useMemo, useState, use } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/server/actions/auth";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/server/validators/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

function SubmitButton({ isValid, missingFields }: { isValid: boolean; missingFields: string[] }) {
  const { pending } = useFormStatus();
  const disabled = !isValid || pending;

  return (
    <div className="space-y-2 mt-2">
      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "w-full font-sans font-medium text-sm py-3 px-6 rounded-md transition-all",
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:opacity-90"
        )}
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>

      {!isValid && missingFields.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Still needed: {missingFields.join(", ")}
        </p>
      )}
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string; email?: string; error?: string }>;
}) {
  const params = use(searchParams);
  const [state, action] = useActionState(loginAction, {});

  const [form, setForm] = useState({
    email: params.email ?? "",
    password: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validation = useMemo(() => {
    return loginSchema.safeParse(form);
  }, [form]);

  const clientErrors = !validation.success ? validation.error.flatten().fieldErrors : {};
  
  const errorFor = (field: string) => {
    return clientErrors[field as keyof typeof clientErrors]?.[0] ?? null;
  };

  const showError = (field: string) => touched[field] && !!errorFor(field);

  const missingFields: string[] = [];
  if (!form.email || clientErrors.email) missingFields.push("Email");
  if (!form.password || clientErrors.password) missingFields.push("Password");

  const isValid = missingFields.length === 0;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span className="font-heading font-medium text-2xl text-foreground">
              Chetan Hi-Tech
            </span>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Industrial Equipment Procurement
          </p>
        </div>

        <div className="border border-border rounded-md bg-card p-8 shadow-sm">
          <h1 className="font-heading font-medium text-xl text-foreground mb-6">
            Sign in to your account
          </h1>

          {/* OAuth Errors from URL */}
          {params.error === "AccessDenied" && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">
                Account not found or access was denied. <Link href="/signup" className="underline font-medium hover:text-destructive/80">Sign up</Link> to create one.
              </p>
            </div>
          )}
          {params.error && params.error !== "AccessDenied" && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">
                Authentication error: {params.error}
              </p>
            </div>
          )}

          {/* Custom Server Errors from Credentials */}
          {state.error === "USER_NOT_FOUND" && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">
                Account not found. <Link href="/signup" className="underline font-medium hover:text-destructive/80">Sign up</Link> to create one.
              </p>
            </div>
          )}
          {state.error === "INVALID_PASSWORD" && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">
                Incorrect password. Please try again.
              </p>
            </div>
          )}
          {state.error && state.error !== "USER_NOT_FOUND" && state.error !== "INVALID_PASSWORD" && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">{state.error}</p>
            </div>
          )}

          <form action={action} noValidate className="space-y-4">
            {params.callbackUrl && (
              <input type="hidden" name="callbackUrl" value={params.callbackUrl} />
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => touch("email")}
                className={cn(
                  "w-full border rounded-md bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2",
                  showError("email")
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive text-foreground"
                    : "border-border focus:ring-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                )}
                placeholder="you@company.com"
              />
              {showError("email") && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errorFor("email")}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <Link
                  href="/forgot"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => touch("password")}
                  className="w-full border border-border rounded-md bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <SubmitButton isValid={isValid} missingFields={missingFields} />
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-3">or</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-border rounded-md py-2.5 px-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New to the platform?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
