import { db } from "@/server/db";
import Link from "next/link";

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      inquiryNumber: true,
      status: true,
      leadScore: true,
      priority: true,
      createdAt: true,
      customer: { select: { name: true, email: true } },
      company: { select: { name: true } },
      assignedTo: { select: { name: true } },
      _count: { select: { quotations: true } },
    },
  });

  const statusColor: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_REVIEW: "bg-orange-100 text-orange-700",
    QUOTED: "bg-green-100 text-green-700",
    WON: "bg-green-200 text-green-800",
    LOST: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const scoreColor: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground">
              ← Admin
            </Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">Inquiries</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Inquiry / Company
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Score
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Assigned
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No inquiries yet. They appear when customers submit RFQs.
                  </td>
                </tr>
              )}
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-muted-foreground">
                      {inq.inquiryNumber}
                    </div>
                    <div className="font-medium text-foreground">{inq.company.name}</div>
                    <div className="text-xs text-muted-foreground">{inq.customer.name}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColor[inq.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {inq.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${scoreColor[inq.leadScore] ?? ""}`}
                    >
                      {inq.leadScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                    {inq.assignedTo?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/inquiries/${inq.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
