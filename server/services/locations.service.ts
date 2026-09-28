import { eq, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { locations } from '../db/schema'
import type { LocationInput } from '../../shared/schemas/locations'
import { ForbiddenError } from '../utils/permissions'
import { recordSlugChangeRedirects } from './redirects.service'

async function assertSlugAvailable(locale: string, slug: string, excludeId?: string) {
  const rows = await db.select({ id: locations.id, slug: locations.slug }).from(locations)
  const taken = rows.some((row) => row.id !== excludeId && row.slug[locale] === slug)
  if (taken) throw new ForbiddenError(`Slug "${slug}" is already used for locale "${locale}"`)
}

export async function listLocations() {
  return db.select().from(locations)
}

export async function getLocationById(id: string) {
  const [row] = await db.select().from(locations).where(eq(locations.id, id)).limit(1)
  if (!row) throw new Error('Location not found')
  return row
}

export async function createLocation(input: LocationInput) {
  for (const [locale, slug] of Object.entries(input.slug)) {
    await assertSlugAvailable(locale, slug)
  }
  const [created] = await db
    .insert(locations)
    .values({
      ...input,
      latitude: input.latitude?.toString(),
      longitude: input.longitude?.toString(),
    })
    .returning()
  if (!created) throw new Error('Location insert did not return a row')
  return created
}

export async function updateLocation(id: string, input: Partial<LocationInput>) {
  let previousSlug: Record<string, string> | undefined
  if (input.slug) {
    for (const [locale, slug] of Object.entries(input.slug)) {
      await assertSlugAvailable(locale, slug, id)
    }
    previousSlug = (await getLocationById(id)).slug
  }
  const [updated] = await db
    .update(locations)
    .set({
      ...input,
      latitude: input.latitude?.toString(),
      longitude: input.longitude?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(locations.id, id))
    .returning()
  if (!updated) throw new Error('Location not found')
  if (input.slug) {
    await recordSlugChangeRedirects(previousSlug, input.slug, (_locale, slug) => `/branches/${slug}`)
  }
  return updated
}

export async function deleteLocation(id: string) {
  await db.delete(locations).where(eq(locations.id, id))
}

export async function getLocationBySlug(locale: string, slug: string) {
  const [row] = await db
    .select()
    .from(locations)
    .where(sql`${locations.slug} ->> ${locale} = ${slug}`)
    .limit(1)
  return row ?? null
}
