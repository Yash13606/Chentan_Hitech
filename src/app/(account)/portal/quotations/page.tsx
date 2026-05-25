import { auth } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { DownloadButton } from "./DownloadButton";

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
      quotations: {
        where: { status: { in: ["APPROVED", "SENT"] } },
        orderBy: { version: "desc" },
        take: 1,
        select: { id: true, version: true, status: true, totalCents: true, approvedAt: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
            New RFQ
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {inquiries.length === 0 ? (
          <div className="border border-border rounded-md bg-card p-10 text-center text-muted-foreground text-sm">
            No inquiries yet.{" "}
            <Link href="/catalog" className="underline underline-offset-4 text-foreground">
              Browse the catalog
            </Link>{" "}
            and submit an RFQ.
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Quotation
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries.map((inq) => {
                  const latestQuote = inq.quotations[0] ?? null;
                  return (
                    <tr key={inq.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{inq.inquiryNumber}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            inq.status === "QUOTED"
                              ? "bg-green-100 text-green-700"
                              : inq.status === "NEW"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {inq.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {latestQuote ? (
                          <span className="text-xs text-muted-foreground font-mono">
                            ₹{(latestQuote.totalCents / 100).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {latestQuote ? (
                          <DownloadButton quotationId={latestQuote.id} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Awaiting quotation</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
