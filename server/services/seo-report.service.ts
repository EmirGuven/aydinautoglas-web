import { desc } from 'drizzle-orm'
import { db } from '../db/client'
import { blogPosts, media, notFoundLogs, pages, services } from '../db/schema'
import { pickTranslatedServer } from '../utils/i18n'

interface MissingMetaItem {
  contentType: 'page' | 'service' | 'blogPost'
  id: string
  title: string
  locale: string
  missingTitle: boolean
  missingDescription: boolean
}

interface DuplicateGroup {
  field: 'metaTitle' | 'metaDescription'
  value: string
  items: { contentType: string; id: string; title: string }[]
}

interface MissingAltTextItem {
  id: string
  originalFileName: string
}

export interface SeoReport {
  missingMeta: MissingMetaItem[]
  missingAltText: MissingAltTextItem[]
  duplicates: DuplicateGroup[]
  topNotFoundPaths: { path: string; hitCount: number }[]
}

/** Site-wide SEO health check (prompt.md §15.5) — read-only aggregation, no caching since it's an admin-only, low-traffic screen. */
export async function buildSeoReport(): Promise<SeoReport> {
  const [allPages, allServices, allPosts, allMedia, topNotFound] = await Promise.all([
    db.select().from(pages),
    db.select().from(services),
    db.select().from(blogPosts),
    db.select().from(media),
    db.select().from(notFoundLogs).orderBy(desc(notFoundLogs.hitCount)).limit(20),
  ])

  const missingMeta: MissingMetaItem[] = []
  const titleGroups = new Map<string, { contentType: string; id: string; title: string }[]>()
  const descriptionGroups = new Map<string, { contentType: string; id: string; title: string }[]>()

  function checkEntry(
    contentType: MissingMetaItem['contentType'],
    id: string,
    displayTitle: Record<string, string>,
    seo: Record<string, { metaTitle?: string; metaDescription?: string }>,
  ) {
    for (const [locale, entry] of Object.entries(seo)) {
      const title = pickTranslatedServer(displayTitle, locale)
      if (!entry.metaTitle || !entry.metaDescription) {
        missingMeta.push({
          contentType,
          id,
          title,
          locale,
          missingTitle: !entry.metaTitle,
          missingDescription: !entry.metaDescription,
        })
      }
      if (entry.metaTitle) {
        const key = `${locale}:${entry.metaTitle.trim().toLowerCase()}`
        const group = titleGroups.get(key) ?? []
        group.push({ contentType, id, title })
        titleGroups.set(key, group)
      }
      if (entry.metaDescription) {
        const key = `${locale}:${entry.metaDescription.trim().toLowerCase()}`
        const group = descriptionGroups.get(key) ?? []
        group.push({ contentType, id, title })
        descriptionGroups.set(key, group)
      }
    }
  }

  for (const page of allPages) checkEntry('page', page.id, page.title, page.seo)
  for (const service of allServices) checkEntry('service', service.id, service.title, service.seo)
  for (const post of allPosts) checkEntry('blogPost', post.id, post.title, post.seo)

  const duplicates: DuplicateGroup[] = [
    ...[...titleGroups.entries()]
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({ field: 'metaTitle' as const, value: key.split(':').slice(1).join(':'), items })),
    ...[...descriptionGroups.entries()]
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({ field: 'metaDescription' as const, value: key.split(':').slice(1).join(':'), items })),
  ]

  const missingAltText: MissingAltTextItem[] = allMedia
    .filter((item) => !Object.values(item.altText).some((value) => value?.trim()))
    .map((item) => ({ id: item.id, originalFileName: item.originalFileName }))

  return {
    missingMeta,
    missingAltText,
    duplicates,
    topNotFoundPaths: topNotFound.map((row) => ({ path: row.path, hitCount: row.hitCount })),
  }
}
