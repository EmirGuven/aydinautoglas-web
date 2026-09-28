import { desc, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { contactMessages } from '../db/schema'

export async function listContactMessages() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt))
}

export async function markContactMessageRead(id: string, isRead: boolean) {
  const [updated] = await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id)).returning()
  if (!updated) throw new Error('Contact message not found')
  return updated
}

export async function deleteContactMessage(id: string) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id))
}
