import { db } from "@/server/db";
import { AdminDashboardClient } from "./AdminDashboardClient";

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
    <AdminDashboardClient 
      stats={{
        products: productCount,
        categories: categoryCount,
        inquiries: inquiryCount,
        users: userCount
      }}
      recentInquiries={recentInquiries as any}
      importRuns={importRuns as any}
    />
  );
}
