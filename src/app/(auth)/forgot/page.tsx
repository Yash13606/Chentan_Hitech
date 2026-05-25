"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { forgotPasswordAction, type ForgotState } from "@/server/actions/auth";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground font-sans font-medium text-sm py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send Reset Link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<ForgotState, FormData>(forgotPasswordAction, {});

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span className="font-heading font-medium text-2xl text-foreground">
              Chetan Hi-Tech
            </span>
          </Link>
        </div>

        <div className="border border-border rounded-md bg-card p-8">
          <h1 className="font-heading font-medium text-xl text-foreground mb-2">
            Reset password
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your work email and we&apos;ll send you a reset link.
          </p>

          {state.success ? (
            <div className="text-sm text-foreground bg-muted/50 border border-border rounded px-4 py-3">
              If an account exists for this email, a reset link has been sent.
              Check your inbox.
            </div>
          ) : (
            <form action={action} className="space-y-4">
              {state.error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                  {state.error}
                </p>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="you@company.com"
                />
              </div>
              <SubmitButton />
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
