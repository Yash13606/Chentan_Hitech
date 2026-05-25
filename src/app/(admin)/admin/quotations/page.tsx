import { db } from "@/server/db";
import Link from "next/link";
import { AdminDownloadButton } from "./AdminDownloadButton";

export default async function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter; // undefined | "meeting" | "won" | "lost"

  // Fetch every auto-generated quotation. Joins inquiry + customer for context.
  const quotations = await db.quotation.findMany({
    where: {
      status: { in: ["SENT", "APPROVED"] },
      ...(filter === "meeting"
        ? { inquiry: { status: "MEETING_REQUESTED" } }
        : filter === "won"
        ? { inquiry: { status: "CLOSED_WON" } }
        : filter === "lost"
        ? { inquiry: { status: "CLOSED_LOST" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      version: true,
      status: true,
      totalCents: true,
      pdfKey: true,
      createdAt: true,
      inquiry: {
        select: {
          id: true,
          inquiryNumber: true,
          status: true,
          leadScore: true,
          meetingRequestedAt: true,
          customer: { select: { name: true, email: true, phone: true } },
          company: { select: { name: true, city: true, state: true } },
        },
      },
    },
  });

  // Counts for the filter chips
  const [totalCount, meetingCount, wonCount] = await Promise.all([
    db.quotation.count({ where: { status: { in: ["SENT", "APPROVED"] } } }),
    db.inquiry.count({ where: { status: "MEETING_REQUESTED" } }),
    db.inquiry.count({ where: { status: "CLOSED_WON" } }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Admin
            </Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">
              All Quotations
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCount} total
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Filter chips */}
        <div className="flex items-center gap-2">
          <FilterChip
            href="/admin/quotations"
            active={!filter}
            label="All"
            count={totalCount}
          />
          <FilterChip
            href="/admin/quotations?filter=meeting"
            active={filter === "meeting"}
            label="Meeting requested"
            count={meetingCount}
            urgent={meetingCount > 0 && filter !== "meeting"}
          />
          <FilterChip
            href="/admin/quotations?filter=won"
            active={filter === "won"}
            label="Won"
            count={wonCount}
          />
        </div>

        {/* Empty state */}
        {quotations.length === 0 ? (
          <div className="border border-border rounded-md bg-card p-10 text-center text-muted-foreground text-sm">
            No quotations match this filter.
          </div>
        ) : (
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/inquiries/${q.inquiry.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {q.inquiry.inquiryNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        v{q.version}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-xs">
                        {q.inquiry.customer.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.inquiry.company.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.inquiry.customer.email}
                        {q.inquiry.customer.phone
                          ? ` · ${q.inquiry.customer.phone}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <InquiryStatusBadge
                        status={q.inquiry.status}
                        leadScore={q.inquiry.leadScore}
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      ₹{(q.totalCents / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(q.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {q.pdfKey ? (
                        <AdminDownloadButton quotationId={q.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No PDF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function FilterChip({
  href,
  active,
  label,
  count,
  urgent,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : urgent
          ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
      <span
        className={`text-[10px] px-1.5 rounded ${
          active ? "bg-background/20" : "bg-muted-foreground/10"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function InquiryStatusBadge({
  status,
  leadScore,
}: {
  status: string;
  leadScore: string;
}) {
  const scoreColor: Record<string, string> = {
    HIGH: "text-red-600",
    MEDIUM: "text-yellow-600",
    LOW: "text-muted-foreground",
  };

  if (status === "MEETING_REQUESTED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          🤝 Meeting requested
        </span>
        <span className={`text-[10px] font-medium ${scoreColor[leadScore]}`}>
          {leadScore}
        </span>
      </div>
    );
  }
  if (status === "QUOTED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
          Quoted
        </span>
        <span className={`text-[10px] font-medium ${scoreColor[leadScore]}`}>
          {leadScore}
        </span>
      </div>
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
        Lost
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      {status.replace(/_/g, " ")}
    </span>
  );
}
