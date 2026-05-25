import { auth } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { DownloadButton } from "./DownloadButton";
import { RequestMeetingButton } from "./RequestMeetingButton";

export default async function PortalQuotationsPage() {
  const session = await auth();

  const inquiries = await db.inquiry.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      inquiryNumber: true,
      status: true,
      createdAt: true,
      meetingRequestedAt: true,
      quotations: {
        where: { status: { in: ["SENT", "APPROVED"] } },
        orderBy: { version: "desc" },
        take: 1,
        select: {
          id: true,
          version: true,
          status: true,
          totalCents: true,
          pdfKey: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/portal"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Dashboard
            </Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">
              My Quotations
            </h1>
          </div>
          <Link
            href="/cart"
            className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
          >
            New Quotation
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {inquiries.length === 0 ? (
          <div className="border border-border rounded-md bg-card p-10 text-center text-muted-foreground text-sm">
            No quotations yet.{" "}
            <Link
              href="/catalog"
              className="underline underline-offset-4 text-foreground"
            >
              Browse the catalog
            </Link>{" "}
            and add equipment to get an instant quotation.
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => {
              const latestQuote = inq.quotations[0] ?? null;
              const meetingRequested = !!inq.meetingRequestedAt;

              return (
                <div
                  key={inq.id}
                  className="border border-border rounded-md bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* Left: reference + status + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {inq.inquiryNumber}
                      </span>
                      <StatusPill
                        status={inq.status}
                        meetingRequested={meetingRequested}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {latestQuote && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-foreground">
                            ₹
                            {(latestQuote.totalCents / 100).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            (incl. GST, indicative)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {latestQuote ? (
                      <>
                        {latestQuote.pdfKey && (
                          <DownloadButton quotationId={latestQuote.id} />
                        )}
                        <RequestMeetingButton
                          quotationId={latestQuote.id}
                          alreadyRequested={meetingRequested}
                        />
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Quotation generating…
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {inquiries.length > 0 && (
          <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Quotation totals are <strong>indicative</strong> and based on catalog
            pricing. Final pricing — including volume discounts, custom configurations,
            and delivery terms — is confirmed during a meeting with our engineering team.
            Click <strong>Request Meeting</strong> on any quotation to start that
            conversation.
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────────────

function StatusPill({
  status,
  meetingRequested,
}: {
  status: string;
  meetingRequested: boolean;
}) {
  if (meetingRequested || status === "MEETING_REQUESTED") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        Meeting requested
      </span>
    );
  }
  if (status === "CLOSED_WON") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        Won
      </span>
    );
  }
  if (status === "CLOSED_LOST") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
        Closed
      </span>
    );
  }
  if (status === "QUOTED") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        Quotation ready
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      {status.replace(/_/g, " ")}
    </span>
  );
}
