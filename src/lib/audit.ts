import "server-only";
import type { DB } from "@/db";
import { schema } from "@/db";

type Tx = Pick<DB, "insert">;

/** Record who did what. Pass the transaction when inside one. */
export async function audit(
  db: Tx,
  actorId: string | null,
  action: string,
  entity: string,
  entityId: string | number | null,
  details?: Record<string, unknown>,
) {
  await db.insert(schema.auditLog).values({
    actorId,
    action,
    entity,
    entityId: entityId == null ? null : String(entityId),
    details: details ?? null,
  });
}
