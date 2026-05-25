import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";

// Layout guard for /admin/* — defence in depth after proxy.ts
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }
  return <>{children}</>;
}
