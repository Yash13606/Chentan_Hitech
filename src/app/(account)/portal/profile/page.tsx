import { auth } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      company: {
        select: {
          name: true,
          industry: true,
          orgSize: true,
          gstin: true,
          website: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          leadScore: true,
        },
      },
    },
  });

  const initials = (user?.name ?? user?.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Page header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <h1 className="font-heading font-medium text-2xl text-foreground leading-tight">
            Company Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep your company details accurate to receive relevant quotations
            and pricing.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Account identity card — non-editable */}
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 font-heading font-medium text-base text-foreground select-none"
            aria-hidden
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user?.email}
            </p>
            {memberSince && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Member since {memberSince}
              </p>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-secondary text-muted-foreground shrink-0">
            {user?.role?.toLowerCase() ?? "customer"}
          </span>
        </div>

        {/* Editable profile form */}
        <ProfileForm
          initial={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            phone: user?.phone ?? "",
            companyName: user?.company?.name ?? "",
            industry: user?.company?.industry ?? "OTHER",
            orgSize: user?.company?.orgSize ?? "",
            gstin: user?.company?.gstin ?? "",
            website: user?.company?.website ?? "",
            address: user?.company?.address ?? "",
            city: user?.company?.city ?? "",
            state: user?.company?.state ?? "",
            pincode: user?.company?.pincode ?? "",
          }}
        />
      </div>
    </div>
  );
}
