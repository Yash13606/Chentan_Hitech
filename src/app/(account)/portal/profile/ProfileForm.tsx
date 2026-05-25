"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { updateProfileAction, type ProfileState } from "@/server/actions/profile";
import { IndustrialButton } from "@/components/ui/industrial-button";

const INDUSTRY_OPTIONS = [
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "DEFENCE", label: "Defence" },
  { value: "MARINE", label: "Marine" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "EDUCATION", label: "Education" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "OTHER", label: "Other" },
];

const ORG_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "500+", label: "500+ employees" },
];

type ProfileInitial = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  orgSize: string;
  gstin: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <IndustrialButton type="submit" disabled={pending} variant="primary">
      {pending ? "Saving…" : "Save Changes"}
    </IndustrialButton>
  );
}

const inputCls =
  "w-full border border-border rounded-xl bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

const labelCls =
  "block text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2";

export function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      {/* Success */}
      {state.success && (
        <div
          className="rounded-xl border p-4 flex items-start gap-3"
          style={{ borderColor: "#c8e8d0", backgroundColor: "#f2faf4" }}
        >
          <CheckCircle2
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "#27a644" }}
          />
          <p className="text-sm text-foreground">Profile updated successfully.</p>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-0.5">
            Personal Info
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelCls}>
              Full Name <span className="text-destructive normal-case tracking-normal">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={initial.name}
              placeholder="Rajesh Sharma"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              value={initial.email}
              readOnly
              disabled
              className={`${inputCls} opacity-50 cursor-not-allowed`}
            />
          </div>
        </div>

        <div className="sm:w-1/2">
          <label htmlFor="phone" className={labelCls}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={initial.phone}
            placeholder="+91 98765 43210"
            className={inputCls}
          />
        </div>
      </div>

      {/* Company Details */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Company Details
        </p>

        <div>
          <label htmlFor="companyName" className={labelCls}>
            Company Name <span className="text-destructive normal-case tracking-normal">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            defaultValue={initial.companyName}
            placeholder="Acme Hospitality Pvt Ltd"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className={labelCls}>
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={initial.industry}
              className={inputCls}
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="orgSize" className={labelCls}>
              Organisation Size
            </label>
            <select
              id="orgSize"
              name="orgSize"
              defaultValue={initial.orgSize}
              className={inputCls}
            >
              <option value="">Not specified</option>
              {ORG_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gstin" className={labelCls}>
              GSTIN{" "}
              <span className="normal-case font-normal tracking-normal text-muted-foreground/70">
                (optional)
              </span>
            </label>
            <input
              id="gstin"
              name="gstin"
              defaultValue={initial.gstin}
              placeholder="22AAAAA0000A1Z5"
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="website" className={labelCls}>
              Website{" "}
              <span className="normal-case font-normal tracking-normal text-muted-foreground/70">
                (optional)
              </span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={initial.website}
              placeholder="https://acmehospitality.com"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Location
        </p>

        <div>
          <label htmlFor="address" className={labelCls}>
            Address
          </label>
          <input
            id="address"
            name="address"
            defaultValue={initial.address}
            placeholder="Plot 12, Industrial Area, Andheri East"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className={labelCls}>
              City
            </label>
            <input
              id="city"
              name="city"
              defaultValue={initial.city}
              placeholder="Mumbai"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="state" className={labelCls}>
              State
            </label>
            <input
              id="state"
              name="state"
              defaultValue={initial.state}
              placeholder="Maharashtra"
              className={inputCls}
            />
          </div>
        </div>

        <div className="sm:w-1/3">
          <label htmlFor="pincode" className={labelCls}>
            Pincode
          </label>
          <input
            id="pincode"
            name="pincode"
            defaultValue={initial.pincode}
            placeholder="400093"
            className={`${inputCls} font-mono`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <SaveBtn />
        <a
          href="/portal"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
