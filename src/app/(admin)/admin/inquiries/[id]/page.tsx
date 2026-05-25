import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QuotationBuilderClient } from "./QuotationBuilderClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      company: { select: { name: true, industry: true, city: true, state: true, orgSize: true } },
      assignedTo: { select: { id: true, name: true } },
      quotations: {
        orderBy: { version: "desc" },
        select: {
          id: true,
          version: true,
          status: true,
          pdfKey: true,
          totalCents: true,
          createdAt: true,
          createdBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
          approvedAt: true,
        },
      },
    },
  });

  if (!inquiry) notFound();

  const cartSnapshot = inquiry.cartSnapshot as Array<{
    productId: string;
    title: string;
    sku: string;
    qty: number;
    priceCents: number | null;
    notes: string | null;
    availability: string;
  }>;

  const statusColor: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_REVIEW: "bg-orange-100 text-orange-700",
    QUOTED: "bg-green-100 text-green-700",
    WON: "bg-green-200 text-green-800",
    LOST: "bg-gray-100 text-gray-600",
  };

  const scoreColor: Record<string, string> = {
    HIGH: "text-red-600",
    MEDIUM: "text-yellow-600",
    LOW: "text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/admin/inquiries"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Inquiries
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="font-heading font-medium text-xl text-foreground">
                {inquiry.inquiryNumber}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusColor[inquiry.status] ?? "bg-muted"}`}
              >
                {inquiry.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: details + cart snapshot ── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Customer + Company */}
          <div className="border border-border rounded-md bg-card p-4">
            <h2 className="font-medium text-sm text-foreground mb-3">Customer</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{inquiry.customer.name}</p>
              <p className="text-muted-foreground text-xs">{inquiry.customer.email}</p>
              <p className="text-muted-foreground text-xs mt-2 font-medium">
                {inquiry.company.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {inquiry.company.industry?.replace(/_/g, " ")}
                {inquiry.company.orgSize ? ` · ${inquiry.company.orgSize} employees` : ""}
              </p>
              {(inquiry.company.city || inquiry.company.state) && (
                <p className="text-muted-foreground text-xs">
                  {[inquiry.company.city, inquiry.company.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Inquiry details */}
          <div className="border border-border rounded-md bg-card p-4">
            <h2 className="font-medium text-sm text-foreground mb-3">Inquiry Details</h2>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lead Score</dt>
                <dd className={`font-medium ${scoreColor[inquiry.leadScore] ?? ""}`}>
                  {inquiry.leadScore}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Priority</dt>
                <dd>{inquiry.priority}</dd>
              </div>
              {inquiry.deliveryLocation && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{inquiry.deliveryLocation}</dd>
                </div>
              )}
              {inquiry.deliveryTimeline && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Timeline</dt>
                  <dd>{inquiry.deliveryTimeline}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Submitted</dt>
                <dd>{new Date(inquiry.createdAt).toLocaleDateString("en-IN")}</dd>
              </div>
            </dl>
            {inquiry.projectNotes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
                <p className="text-xs text-foreground leading-relaxed">
                  {inquiry.projectNotes}
                </p>
              </div>
            )}
          </div>

          {/* Cart snapshot */}
          <div className="border border-border rounded-md bg-card p-4">
            <h2 className="font-medium text-sm text-foreground mb-3">
              RFQ Items ({cartSnapshot.length})
            </h2>
            <div className="space-y-3">
              {cartSnapshot.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-3 shrink-0">
                    × {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Quotation builder + history ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Existing quotations */}
          {inquiry.quotations.length > 0 && (
            <div className="border border-border rounded-md bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-medium text-sm text-foreground">Quotation History</h2>
              </div>
              <div className="divide-y divide-border">
                {inquiry.quotations.map((q) => (
                  <div key={q.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">
                        Rev {q.version}
                      </span>
                      <span
                        className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                          q.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : q.status === "PENDING_APPROVAL"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {q.status.replace(/_/g, " ")}
                      </span>
                      {q.totalCents > 0 && (
                        <span className="ml-3 text-xs text-muted-foreground font-mono">
                          ₹{(q.totalCents / 100).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      {/* PDF/Approve actions handled client-side */}
                      <QuotationActionsInline
                        quotationId={q.id}
                        status={q.status}
                        hasPdf={!!q.pdfKey}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotation builder */}
          <QuotationBuilderClient
            inquiryId={inquiry.id}
            cartSnapshot={cartSnapshot}
          />
        </div>
      </div>
    </div>
  );
}

// Small inline component for PDF actions — imported from the same file
// (real button logic lives in the client component)
function QuotationActionsInline({
  quotationId,
  status,
  hasPdf,
}: {
  quotationId: string;
  status: string;
  hasPdf: boolean;
}) {
  // These are server-rendered placeholders — the real interactive version
  // is in QuotationBuilderClient via state
  return (
    <Link
      href={`/admin/inquiries`}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {status === "PENDING_APPROVAL" ? "Approve →" : hasPdf ? "Preview →" : ""}
    </Link>
  );
}
