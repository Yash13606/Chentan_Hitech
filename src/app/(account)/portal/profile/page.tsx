"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { updateProfileAction, type ProfileState } from "@/server/actions/profile";
import { CheckCircle } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "HOSPITALITY",
  "HEALTHCARE",
  "DEFENCE",
  "CORPORATE",
  "EDUCATION",
  "RETAIL",
  "MARINE",
  "GOVERNMENT",
  "OTHER",
];

const ORG_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/portal"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Dashboard
            </Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">
              Company Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {state.success && (
          <div className="mb-6 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Profile updated successfully.
          </div>
        )}

        {state.error && (
          <p className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-3">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-5">
          <div className="border border-border rounded-md bg-card p-5 space-y-4">
            <h2 className="font-medium text-sm text-foreground">Company Details</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Company Name *
              </label>
              <input
                name="companyName"
                required
                placeholder="Acme Hospitality Pvt Ltd"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Industry
                </label>
                <select
                  name="industry"
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind.charAt(0) + ind.slice(1).toLowerCase().replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Organisation Size
                </label>
                <select
                  name="orgSize"
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Not specified</option>
                  {ORG_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">City</label>
                <input
                  name="city"
                  placeholder="Mumbai"
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">State</label>
                <input
                  name="state"
                  placeholder="Maharashtra"
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="border border-border rounded-md bg-card p-5 space-y-4">
            <h2 className="font-medium text-sm text-foreground">Contact</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
            <Link
              href="/portal"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
