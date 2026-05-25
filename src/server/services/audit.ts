import "server-only";
import { db } from "@/server/db";

/**
 * Write an audit log entry.
 * Silent on failure — never throw from here.
 */
export async function writeAuditLog(
  actorId: string | null | undefined,
  action: string,
  entity: string,
  entityId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diff: any = {}
) {
  try {
    await db.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        entity,
        entityId,
        diff,
      },
    });
  } catch (err) {
    // Audit failures must never crash the main flow
    console.error("[AuditLog] Failed to write:", err);
  }
}
