import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { notFoundLogs } from '../db/schema'

/** Called from server/plugins/not-found-logger.ts on every public 404 (prompt.md §15.1). */
export async function recordNotFoundHit(path: string) {
  await db
    .insert(notFoundLogs)
    .values({ path })
    .onConflictDoUpdate({
      target: notFoundLogs.path,
      set: { hitCount: sql`${notFoundLogs.hitCount} + 1`, lastSeenAt: new Date() },
    })
}

export async function listNotFoundLogs() {
  return db.select().from(notFoundLogs).orderBy(desc(notFoundLogs.hitCount))
}

export async function getNotFoundLogById(id: string) {
  const [row] = await db.select().from(notFoundLogs).where(eq(notFoundLogs.id, id)).limit(1)
  return row ?? null
}

export async function deleteNotFoundLog(id: string) {
  await db.delete(notFoundLogs).where(eq(notFoundLogs.id, id))
}
