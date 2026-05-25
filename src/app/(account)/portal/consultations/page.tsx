import { auth } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Video } from "lucide-react";
import { ConsultationForm } from "./ConsultationForm";

const TYPE_LABELS: Record<string, string> = {
  PRODUCT_INQUIRY: "Product Inquiry",
  SITE_VISIT: "Site Visit",
  ENGINEERING: "Engineering Consultation",
  PROJECT_PLANNING: "Project Planning",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  REQUESTED: {
    label: "Requested",
    className: "bg-secondary text-muted-foreground",
  },
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-[#dcf0e2] text-[#1a7530]",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
  },
};

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
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <h1 className="font-heading font-medium text-2xl text-foreground leading-tight">
            Consultations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Book time with our specialists for equipment advice and project
            planning.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Booking form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_24px]">
          <div className="mb-6">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-1.5">
              Book a Session
            </p>
            <h2 className="font-heading font-medium text-xl text-foreground">
              Request a Consultation
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Select a session type and a preferred time. We typically confirm
              within one business day.
            </p>
          </div>
          <ConsultationForm />
        </div>

        {/* Previous consultations */}
        {consultations.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-foreground mb-3">
              Previous Requests
            </h2>
            <div className="space-y-2">
              {consultations.map((c) => {
                const status =
                  STATUS_CONFIG[c.status] ?? {
                    label: c.status,
                    className: "bg-muted text-muted-foreground",
                  };
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border bg-card px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">
                            {TYPE_LABELS[c.type] ??
                              c.type.replace(/_/g, " ")}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {c.requestedSlot && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 shrink-0" />
                              Requested:{" "}
                              {new Date(c.requestedSlot).toLocaleString(
                                "en-IN",
                                { dateStyle: "medium", timeStyle: "short" }
                              )}
                            </p>
                          )}
                          {c.confirmedSlot && (
                            <p className="flex items-center gap-1.5 text-xs text-[#1a7530]">
                              <Calendar className="w-3 h-3 shrink-0" />
                              Confirmed:{" "}
                              {new Date(c.confirmedSlot).toLocaleString(
                                "en-IN",
                                { dateStyle: "medium", timeStyle: "short" }
                              )}
                            </p>
                          )}
                          {c.meetingUrl && (
                            <a
                              href={c.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              <Video className="w-3 h-3" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
