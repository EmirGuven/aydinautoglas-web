import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { faqCategories, faqs } from '../db/schema'
import type { FaqCategoryInput, FaqInput } from '../../shared/schemas/faqs'

// Categories
export async function listFaqCategories() {
  return db.select().from(faqCategories).orderBy(faqCategories.sortOrder)
}

export async function createFaqCategory(input: FaqCategoryInput) {
  const siblings = await db.select({ id: faqCategories.id }).from(faqCategories)
  const [created] = await db.insert(faqCategories).values({ ...input, sortOrder: siblings.length }).returning()
  if (!created) throw new Error('FAQ category insert did not return a row')
  return created
}

export async function updateFaqCategory(id: string, input: Partial<FaqCategoryInput>) {
  const [updated] = await db.update(faqCategories).set(input).where(eq(faqCategories.id, id)).returning()
  if (!updated) throw new Error('FAQ category not found')
  return updated
}

export async function deleteFaqCategory(id: string) {
  await db.delete(faqCategories).where(eq(faqCategories.id, id))
}

// FAQs
export async function listFaqs() {
  return db.select().from(faqs).orderBy(faqs.sortOrder)
}

export async function createFaq(input: FaqInput) {
  const siblings = await db.select({ id: faqs.id }).from(faqs)
  const [created] = await db.insert(faqs).values({ ...input, sortOrder: siblings.length }).returning()
  if (!created) throw new Error('FAQ insert did not return a row')
  return created
}

export async function updateFaq(id: string, input: Partial<FaqInput>) {
  const [updated] = await db.update(faqs).set(input).where(eq(faqs.id, id)).returning()
  if (!updated) throw new Error('FAQ not found')
  return updated
}

export async function deleteFaq(id: string) {
  await db.delete(faqs).where(eq(faqs.id, id))
}

export async function reorderFaqs(orderedIds: string[]) {
  await Promise.all(orderedIds.map((id, index) => db.update(faqs).set({ sortOrder: index }).where(eq(faqs.id, id))))
}
