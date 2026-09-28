import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { testimonials } from '../db/schema'
import type { TestimonialInput } from '../../shared/schemas/testimonials'

export async function listTestimonials() {
  return db.select().from(testimonials).orderBy(testimonials.sortOrder)
}

export async function createTestimonial(input: TestimonialInput) {
  const siblings = await db.select({ id: testimonials.id }).from(testimonials)
  const [created] = await db.insert(testimonials).values({ ...input, sortOrder: siblings.length }).returning()
  if (!created) throw new Error('Testimonial insert did not return a row')
  return created
}

export async function updateTestimonial(id: string, input: Partial<TestimonialInput>) {
  const [updated] = await db.update(testimonials).set(input).where(eq(testimonials.id, id)).returning()
  if (!updated) throw new Error('Testimonial not found')
  return updated
}

export async function deleteTestimonial(id: string) {
  await db.delete(testimonials).where(eq(testimonials.id, id))
}

export async function reorderTestimonials(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => db.update(testimonials).set({ sortOrder: index }).where(eq(testimonials.id, id))),
  )
}
