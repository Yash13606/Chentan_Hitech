import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { PortalClient } from "./PortalClient";

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
    <main className="min-h-screen bg-background">
      <PortalClient user={user} recentInquiries={recentInquiries} rfq={rfq} />
    </main>
  );
}
