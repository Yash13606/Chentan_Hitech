import { auth } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { CheckCircle, ShoppingCart, FileText, BookOpen, Users, User, Package } from "lucide-react";

interface PortalPageProps {
  searchParams: Promise<{ rfq?: string }>;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const { rfq } = await searchParams;
  const session = await auth();

  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    select: {
      name: true,
      email: true,
      company: {
        select: { name: true, industry: true },
      },
      _count: { select: { inquiries: true } },
    },
  });

  const recentInquiries = await db.inquiry.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      inquiryNumber: true,
      status: true,
      leadScore: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-background pt-16">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* RFQ success banner */}
        {rfq && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-md px-5 py-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                RFQ submitted successfully!
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Inquiry reference: <span className="font-mono">{rfq}</span>. Our team
                will respond within 24 hours with an official quotation.
              </p>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-heading font-medium text-3xl text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.company?.name} &middot;{" "}
            {user?.company?.industry?.toLowerCase().replace(/_/g, " ")}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            {
              href: "/catalog",
              icon: BookOpen,
              label: "Browse",
              title: "Equipment Catalog",
              sub: "Explore catalog with pricing",
            },
            {
              href: "/cart",
              icon: ShoppingCart,
              label: "Quotation",
              title: "My Cart",
              sub: "View and submit your RFQ",
            },
            {
              href: "/portal/quotations",
              icon: FileText,
              label: "History",
              title: "My Quotations",
              sub: `${user?._count?.inquiries ?? 0} inquiries submitted`,
            },
            {
              href: "/portal/consultations",
              icon: Users,
              label: "Consult",
              title: "Consultations",
              sub: "Book a call with our team",
            },
            {
              href: "/portal/bundles",
              icon: Package,
              label: "Bundles",
              title: "Saved Bundles",
              sub: "Reusable equipment sets",
            },
            {
              href: "/portal/profile",
              icon: User,
              label: "Profile",
              title: "Company Profile",
              sub: "Update your details",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="border border-border rounded-md bg-card p-5 hover:border-primary/50 transition-colors group"
            >
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {action.label}
              </div>
              <div className="font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{action.sub}</p>
            </Link>
          ))}
        </div>

        {/* Recent inquiries */}
        <div className="border border-border rounded-md bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-medium text-base text-foreground">
              Recent Inquiries
            </h2>
            <Link
              href="/portal/quotations"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="px-5 py-10 text-center text-muted-foreground text-sm">
              No inquiries yet.{" "}
              <Link href="/catalog" className="underline underline-offset-4 text-foreground">
                Browse the catalog
              </Link>{" "}
              and add equipment to your RFQ.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {inq.inquiryNumber}
                    </span>
                    <span
                      className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                        inq.status === "NEW"
                          ? "bg-blue-100 text-blue-700"
                          : inq.status === "QUOTED"
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {inq.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
