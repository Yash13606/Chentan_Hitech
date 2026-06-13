import { db } from "@/server/db";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  return <AdminUsersClient users={users as any} />;
}
