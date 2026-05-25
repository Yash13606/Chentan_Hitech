import "server-only";
import { auth } from "@/server/auth";
import { Role } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    role: Role;
    companyId?: string | null;
    name?: string | null;
  };
};

/** Require an authenticated session. Redirects to /login if not present. */
export async function requireAuth(): Promise<AuthSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session as AuthSession;
}

/** Require a specific role (or one of several roles). Returns the session. */
export async function requireRole(...roles: Role[]): Promise<AuthSession> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    redirect("/unauthorized");
  }
  return session;
}

/** Shorthand wrappers */
export const requireAdmin = () => requireRole(Role.ADMIN);
export const requireSalesOrAbove = () =>
  requireRole(Role.SALES, Role.QUOTE_MGR, Role.ADMIN);
export const requireQuoteMgrOrAbove = () =>
  requireRole(Role.QUOTE_MGR, Role.ADMIN);
