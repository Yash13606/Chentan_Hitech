import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";

// TODO(temp): remove this dev-only bypass before deploying any admin work.
// While NODE_ENV !== "production" we open /admin/* without auth so localhost
// can land straight on the dashboard. Production still enforces the check.
const DEV_BYPASS_ADMIN_AUTH = process.env.NODE_ENV !== "production";

// Layout guard for /admin/* — defence in depth after proxy.ts
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (DEV_BYPASS_ADMIN_AUTH) {
    return <>{children}</>;
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }
  return <>{children}</>;
}
