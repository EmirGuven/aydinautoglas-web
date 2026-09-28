import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { redirects } from '../db/schema'
import type { RedirectInput } from '../../shared/schemas/redirects'
import { getDefaultLocaleCode, withLocalePrefix } from '../utils/locale-paths'

export async function listRedirects() {
  return db.select().from(redirects).orderBy(redirects.fromPath)
}

/**
 * Short-TTL in-process cache of the full table, keyed by fromPath: the redirects
 * middleware runs on every GET request, but the table only changes from the admin UI
 * or an occasional slug rename. Invalidated immediately on any write below.
 */
let cache: { byPath: Map<string, Awaited<ReturnType<typeof listRedirects>>[number]>; expiresAt: number } | null = null
const TTL_MS = 60_000

async function getCache() {
  if (cache && cache.expiresAt > Date.now()) return cache.byPath
  const rows = await listRedirects()
  const byPath = new Map(rows.map((row) => [row.fromPath, row]))
  cache = { byPath, expiresAt: Date.now() + TTL_MS }
  return byPath
}

export async function getRedirectByFromPath(fromPath: string) {
  const byPath = await getCache()
  return byPath.get(fromPath) ?? null
}

export async function createRedirect(input: RedirectInput) {
  const [created] = await db.insert(redirects).values(input).onConflictDoUpdate({ target: redirects.fromPath, set: input }).returning()
  if (!created) throw new Error('Redirect insert did not return a row')
  cache = null
  return created
}

export async function updateRedirect(id: string, input: Partial<RedirectInput>) {
  const [updated] = await db.update(redirects).set(input).where(eq(redirects.id, id)).returning()
  if (!updated) throw new Error('Redirect not found')
  cache = null
  return updated
}

export async function deleteRedirect(id: string) {
  await db.delete(redirects).where(eq(redirects.id, id))
  cache = null
}

/**
 * Called from a module's update-service whenever a translatable slug changes, so an old
 * indexed URL 301s to its new location instead of 404ing (prompt.md §15.1). No-ops if the
 * old path is still in use by something else (shouldn't happen — slugs are unique per
 * locale — but never overwrite an unrelated existing redirect silently).
 */
export async function recordSlugChangeRedirect(fromPath: string, toPath: string) {
  if (fromPath === toPath) return
  const existing = await getRedirectByFromPath(fromPath)
  if (existing) return
  await db.insert(redirects).values({ fromPath, toPath, statusCode: 301 })
  cache = null
}

/**
 * Diffs a translatable slug map (old vs new) and records a 301 for each locale whose slug
 * actually changed. `toPath(locale, slug)` builds the section-relative path (e.g.
 * `/services/${slug}` or, for CMS pages, just `/${slug}`) before the locale prefix is added.
 */
export async function recordSlugChangeRedirects(
  oldSlugs: Record<string, string> | undefined,
  newSlugs: Record<string, string>,
  toPath: (locale: string, slug: string) => string,
) {
  if (!oldSlugs) return
  const defaultCode = await getDefaultLocaleCode()
  for (const [locale, oldSlug] of Object.entries(oldSlugs)) {
    const newSlug = newSlugs[locale]
    if (!oldSlug || !newSlug || oldSlug === newSlug) continue
    const fromPath = withLocalePrefix(toPath(locale, oldSlug), locale, defaultCode)
    const toPathResolved = withLocalePrefix(toPath(locale, newSlug), locale, defaultCode)
    await recordSlugChangeRedirect(fromPath, toPathResolved)
  }
}
