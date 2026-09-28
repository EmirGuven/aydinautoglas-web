import { eq, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { services } from '../db/schema'
import type { ServiceInput } from '../../shared/schemas/services'
import { ForbiddenError } from '../utils/permissions'
import { sanitizeTranslatableHtml } from '../utils/sanitize-rich-text'
import { recordSlugChangeRedirects } from './redirects.service'

async function assertSlugAvailable(locale: string, slug: string, excludeId?: string) {
  const rows = await db.select({ id: services.id, slug: services.slug }).from(services)
  const taken = rows.some((row) => row.id !== excludeId && row.slug[locale] === slug)
  if (taken) throw new ForbiddenError(`Slug "${slug}" is already used for locale "${locale}"`)
}

export async function listServices() {
  return db.select().from(services).orderBy(services.sortOrder)
}

export async function getServiceById(id: string) {
  const [row] = await db.select().from(services).where(eq(services.id, id)).limit(1)
  if (!row) throw new Error('Service not found')
  return row
}

export async function createService(input: ServiceInput) {
  for (const [locale, slug] of Object.entries(input.slug)) {
    await assertSlugAvailable(locale, slug)
  }
  const siblings = await db.select({ id: services.id }).from(services)
  const [created] = await db
    .insert(services)
    .values({ ...input, content: sanitizeTranslatableHtml(input.content), sortOrder: siblings.length })
    .returning()
  if (!created) throw new Error('Service insert did not return a row')
  return created
}

export async function updateService(id: string, input: Partial<ServiceInput>) {
  let previousSlug: Record<string, string> | undefined
  if (input.slug) {
    for (const [locale, slug] of Object.entries(input.slug)) {
      await assertSlugAvailable(locale, slug, id)
    }
    previousSlug = (await getServiceById(id)).slug
  }
  const values: Partial<typeof services.$inferInsert> = { ...input, updatedAt: new Date() }
  if (input.content) values.content = sanitizeTranslatableHtml(input.content)
  const [updated] = await db.update(services).set(values).where(eq(services.id, id)).returning()
  if (!updated) throw new Error('Service not found')
  if (input.slug) {
    await recordSlugChangeRedirects(previousSlug, input.slug, (_locale, slug) => `/services/${slug}`)
  }
  return updated
}

export async function deleteService(id: string) {
  await db.delete(services).where(eq(services.id, id))
}

export async function reorderServices(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => db.update(services).set({ sortOrder: index }).where(eq(services.id, id))),
  )
}

export async function getServiceBySlug(locale: string, slug: string) {
  const [row] = await db
    .select()
    .from(services)
    .where(sql`${services.slug} ->> ${locale} = ${slug}`)
    .limit(1)
  return row ?? null
}
