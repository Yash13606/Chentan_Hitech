import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  ClipboardList,
  MapPin,
  Package,
  Video,
  Wrench,
} from "lucide-react";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { cn } from "@/lib/utils";

import { ConsultationForm } from "./ConsultationForm";

// ─────────────────────────────────────────────────────
// LOOKUPS
// ─────────────────────────────────────────────────────

const TYPE_META: Record<
  string,
  { label: string; Icon: typeof Package }
> = {
  PRODUCT_INQUIRY: { label: "Product Inquiry", Icon: Package },
  SITE_VISIT: { label: "Site Visit", Icon: MapPin },
  ENGINEERING: { label: "Engineering Consultation", Icon: Wrench },
  PROJECT_PLANNING: { label: "Project Planning", Icon: ClipboardList },
};

const STATUS_META: Record<
  string,
  { label: string; tone: "neutral" | "scheduled" | "done" | "cancelled" }
> = {
  REQUESTED: { label: "Requested", tone: "neutral" },
  SCHEDULED: { label: "Scheduled", tone: "scheduled" },
  COMPLETED: { label: "Completed", tone: "done" },
  CANCELLED: { label: "Cancelled", tone: "cancelled" },
};

function StatusPill({ tone, children }: { tone: keyof typeof STATUS_TONES; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-[11px] font-medium tracking-tight",
        STATUS_TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES = {
  neutral: "bg-muted text-muted-foreground",
  scheduled: "bg-[#dcf0e2] text-[#1a7530]",
  done: "bg-foreground/[0.06] text-foreground/70",
  cancelled: "bg-destructive/10 text-destructive",
} as const;

// ─────────────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────────────

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatRelative(when: Date): string {
  const diffMs = when.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const past = diffMs < 0;

  const minutes = Math.round(absMs / 60_000);
  if (minutes < 60) return past ? `${minutes}m ago` : `in ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return past ? `${hours}h ago` : `in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return past ? `${days}d ago` : `in ${days}d`;
  const months = Math.round(days / 30);
  return past ? `${months}mo ago` : `in ${months}mo`;
}

// ─────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────

export default async function ConsultationsPage() {
  const session = await auth();

  const consultations = await db.consultation.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      requestedSlot: true,
      confirmedSlot: true,
      meetingUrl: true,
      notes: true,
      createdAt: true,
    },
  });

  return (
    <main className="pt-24 pb-20 bg-background text-foreground">
        {/* ── Editorial header ───────────────────────────────── */}
        <header className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-muted-foreground mb-3">
              Portal · Consultations
            </p>
            <h1 className="font-heading font-medium text-4xl md:text-5xl tracking-tight leading-[1.05]">
              Talk to our specialists.
            </h1>
            <p className="mt-3 text-muted-foreground text-base leading-relaxed max-w-xl">
              Book time with our engineering and sourcing team for layout
              planning, equipment selection, and tender response support. We
              typically confirm within one business day.
            </p>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
            {/* Form column */}
            <section>
              <div className="border border-border rounded-lg bg-card p-6 md:p-8">
                <div className="mb-7">
                  <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                    Book a session
                  </p>
                  <h2 className="font-heading font-medium text-2xl text-foreground tracking-tight">
                    Request a consultation
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
                    Pick a session type and a preferred slot. Notes help our
                    team prepare so the first call is useful, not exploratory.
                  </p>
                </div>
                <ConsultationForm />
              </div>

              {/* Help strip */}
              <div className="mt-5 flex items-start gap-3 text-xs text-muted-foreground bg-muted/30 border border-border rounded-md px-4 py-3">
                <CalendarClock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Slots are confirmed by our team after a quick review of your
                  profile and the request. You&apos;ll receive an email with the
                  confirmed time and a meeting link.
                </p>
              </div>
            </section>

            {/* Past requests column */}
            <aside className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground">
                  Your requests
                </h2>
                {consultations.length > 0 && (
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {consultations.length} total
                  </span>
                )}
              </div>

              {consultations.length === 0 ? (
                <div className="border border-dashed border-border rounded-md px-5 py-10 text-center">
                  <div className="w-9 h-9 mx-auto mb-3 rounded-full bg-muted grid place-items-center text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="font-heading text-sm font-medium text-foreground">
                    No requests yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[18rem] mx-auto leading-relaxed">
                    Your booked sessions will appear here. Confirmed slots show
                    a join link.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {consultations.map((c) => {
                    const meta =
                      TYPE_META[c.type] ?? {
                        label: c.type.replace(/_/g, " "),
                        Icon: Package,
                      };
                    const status =
                      STATUS_META[c.status] ?? {
                        label: c.status,
                        tone: "neutral" as const,
                      };
                    const Icon = meta.Icon;

                    const primaryDate = c.confirmedSlot ?? c.requestedSlot;

                    return (
                      <li
                        key={c.id}
                        className="group border border-border rounded-md bg-card hover:border-foreground/20 transition-colors"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "shrink-0 w-9 h-9 rounded-md grid place-items-center transition-colors",
                                status.tone === "scheduled"
                                  ? "bg-[#dcf0e2] text-[#1a7530]"
                                  : status.tone === "cancelled"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Icon className="w-4 h-4" aria-hidden />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-3">
                                <p className="text-sm font-medium text-foreground leading-tight truncate">
                                  {meta.label}
                                </p>
                                <StatusPill tone={status.tone}>
                                  {status.label}
                                </StatusPill>
                              </div>

                              {primaryDate && (
                                <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                                  {c.confirmedSlot ? "Confirmed " : "Requested "}
                                  <span className="text-foreground/80">
                                    {DATE_FMT.format(new Date(primaryDate))}
                                  </span>
                                  <span className="mx-1.5 text-muted-foreground/50">·</span>
                                  <span className="font-mono text-muted-foreground/70">
                                    {formatRelative(new Date(primaryDate))}
                                  </span>
                                </p>
                              )}

                              {c.notes && (
                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {c.notes}
                                </p>
                              )}

                              {c.meetingUrl && (
                                <a
                                  href={c.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
                                >
                                  <Video className="w-3 h-3" />
                                  Join meeting
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          </div>
        </div>
    </main>
  );
}
