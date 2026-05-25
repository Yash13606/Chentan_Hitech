import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CrmInquiryRow } from "./CrmInquiryRow";

type FilterStatus = "ALL" | "NEW" | "ASSIGNED" | "IN_REVIEW" | "QUOTED" | "CLOSED_WON" | "CLOSED_LOST";

interface CrmPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const session = await auth();

  // Role gate — SALES, QUOTE_MGR, or ADMIN
  const allowedRoles = ["SALES", "QUOTE_MGR", "ADMIN"];
  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    redirect("/portal");
  }

  const { status: filterStatus = "ALL" } = await searchParams;

  const where =
    filterStatus !== "ALL"
      ? { status: filterStatus as Exclude<FilterStatus, "ALL"> }
      : {};

  const inquiries = await db.inquiry.findMany({
    where,
    orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      inquiryNumber: true,
      status: true,
      leadScore: true,
      priority: true,
      createdAt: true,
      deliveryLocation: true,
      projectNotes: true,
      customer: { select: { name: true, email: true } },
      company: { select: { name: true, industry: true } },
      assignedTo: { select: { id: true, name: true } },
      cartSnapshot: true,
      _count: { select: { quotations: true, callLogs: true } },
    },
  });

  // Get sales team for assignment dropdown
  const salesUsers = await db.user.findMany({
    where: { role: { in: ["SALES", "QUOTE_MGR", "ADMIN"] } },
    select: { id: true, name: true, role: true },
  });

  const statusTabs: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "ALL" },
    { label: "New", value: "NEW" },
    { label: "Assigned", value: "ASSIGNED" },
    { label: "In Review", value: "IN_REVIEW" },
    { label: "Quoted", value: "QUOTED" },
    { label: "Won", value: "CLOSED_WON" },
    { label: "Lost", value: "CLOSED_LOST" },
  ];

  const counts = {
    ALL: inquiries.length,
    NEW: inquiries.filter((i) => i.status === "NEW").length,
    ASSIGNED: inquiries.filter((i) => i.status === "ASSIGNED").length,
    IN_REVIEW: inquiries.filter((i) => i.status === "IN_REVIEW").length,
    QUOTED: inquiries.filter((i) => i.status === "QUOTED").length,
    CLOSED_WON: inquiries.filter((i) => i.status === "CLOSED_WON").length,
    CLOSED_LOST: inquiries.filter((i) => i.status === "CLOSED_LOST").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground">
              ← Admin
            </Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">
              Sales CRM
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{session.user.name}</span>
            <Link href="/" className="hover:text-foreground transition-colors">
              Back to site
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-border bg-muted/30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex gap-6 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{counts.NEW}</strong> new
          </span>
          <span>
            <strong className="text-foreground">{counts.IN_REVIEW}</strong> in review
          </span>
          <span>
            <strong className="text-foreground">{counts.QUOTED}</strong> quoted
          </span>
          <span>
            <strong className="text-foreground">{counts.CLOSED_WON}</strong> won this period
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Status filter tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {statusTabs.map((tab) => {
            const active = filterStatus === tab.value;
            return (
              <Link
                key={tab.value}
                href={`/crm${tab.value !== "ALL" ? `?status=${tab.value}` : ""}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
                {counts[tab.value] > 0 && (
                  <span
                    className={`ml-1.5 ${active ? "opacity-70" : "text-muted-foreground"}`}
                  >
                    {counts[tab.value]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Inquiry list */}
        {inquiries.length === 0 ? (
          <div className="border border-border rounded-md bg-card p-10 text-center text-muted-foreground text-sm">
            No inquiries match this filter.
          </div>
        ) : (
          <div className="space-y-2">
            {inquiries.map((inq) => (
              <CrmInquiryRow
                key={inq.id}
                inquiry={{
                  ...inq,
                  cartSnapshot: inq.cartSnapshot as Array<{ title: string; qty: number }>,
                }}
                salesUsers={salesUsers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
