import { db } from '../db/client'
import { auditLog } from '../db/schema'

export async function recordAuditLog(entry: {
  userId: string | null
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  await db.insert(auditLog).values({
    userId: entry.userId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    metadata: entry.metadata ?? {},
  })
}
