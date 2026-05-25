import { db } from "@/server/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, categoryCount, inquiryCount, userCount] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.category.count(),
    db.inquiry.count(),
    db.user.count(),
  ]);

  const recentInquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      inquiryNumber: true,
      status: true,
      leadScore: true,
      createdAt: true,
      customer: { select: { name: true, email: true } },
      company: { select: { name: true } },
    },
  });

  const importRuns = await db.importRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, status: true, totalRows: true, okRows: true, failedRows: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</span>
            <h1 className="font-heading font-medium text-xl text-foreground">Dashboard</h1>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            <Link href="/admin/quotations" className="text-muted-foreground hover:text-foreground transition-colors">Quotations</Link>
            <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground transition-colors">Inquiries</Link>
            <Link href="/admin/products/import" className="text-muted-foreground hover:text-foreground transition-colors">Import</Link>
            <Link href="/crm" className="text-muted-foreground hover:text-foreground transition-colors">CRM</Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Back to site</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Products", value: productCount },
            { label: "Categories", value: categoryCount },
            { label: "Total Inquiries", value: inquiryCount },
            { label: "Registered Users", value: userCount },
          ].map((stat) => (
            <div key={stat.label} className="border border-border rounded-md bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="font-heading font-medium text-3xl text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent inquiries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-medium text-lg text-foreground">Recent Inquiries</h2>
              <Link href="/crm" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all →
              </Link>
            </div>
            <div className="border border-border rounded-md overflow-hidden">
              {recentInquiries.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No inquiries yet. They will appear here when customers submit RFQs.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {recentInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-muted-foreground">{inq.inquiryNumber}</div>
                          <div className="font-medium text-foreground">{inq.company.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                            inq.leadScore === "HIGH" ? "bg-red-100 text-red-700" :
                            inq.leadScore === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {inq.leadScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {inq.status.replace("_", " ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick actions + import history */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-medium text-lg text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/admin/products/new", label: "Add Product" },
                  { href: "/admin/products/import", label: "Import CSV" },
                  { href: "/admin/inquiries", label: "View Inquiries" },
                  { href: "/crm", label: "CRM" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="border border-border rounded-md bg-card p-4 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {importRuns.length > 0 && (
              <div>
                <h2 className="font-heading font-medium text-base text-foreground mb-3">Recent Imports</h2>
                <div className="space-y-2">
                  {importRuns.map((run) => (
                    <div key={run.id} className="border border-border rounded-md px-4 py-2.5 text-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === "COMPLETED" ? "bg-green-500" :
                          run.status === "FAILED" ? "bg-red-500" : "bg-yellow-500"
                        }`} />
                        <span className="text-muted-foreground">
                          {run.totalRows} rows · {run.okRows} ok · {run.failedRows} failed
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
