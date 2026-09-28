import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { partners } from '../db/schema'
import type { PartnerInput } from '../../shared/schemas/partners'

export async function listPartners() {
  return db.select().from(partners).orderBy(partners.sortOrder)
}

export async function createPartner(input: PartnerInput) {
  const siblings = await db.select({ id: partners.id }).from(partners)
  const [created] = await db.insert(partners).values({ ...input, sortOrder: siblings.length }).returning()
  if (!created) throw new Error('Partner insert did not return a row')
  return created
}

export async function updatePartner(id: string, input: Partial<PartnerInput>) {
  const [updated] = await db.update(partners).set(input).where(eq(partners.id, id)).returning()
  if (!updated) throw new Error('Partner not found')
  return updated
}

export async function deletePartner(id: string) {
  await db.delete(partners).where(eq(partners.id, id))
}

export async function reorderPartners(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => db.update(partners).set({ sortOrder: index }).where(eq(partners.id, id))),
  )
}
