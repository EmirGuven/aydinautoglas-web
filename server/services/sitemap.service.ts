import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { blogPosts, languages, locations, pages, services } from '../db/schema'

export interface SitemapUrl {
  /** locale code -> path (no origin, no locale prefix applied yet — caller adds that). */
  paths: Record<string, string>
  lastmod: Date
}

/**
 * Every public URL that should appear in the sitemap, grouped so each entry carries its
 * own per-locale alternates (for the <xhtml:link hreflang> entries Google expects per-URL,
 * not just a flat list of URLs). Draft pages, noindexed pages, and blog posts unpublished in
 * a given locale are excluded — the same visibility rules the public site itself applies.
 */
export async function listSitemapUrls(): Promise<SitemapUrl[]> {
  const activeLanguages = await db.select({ code: languages.code }).from(languages).where(eq(languages.isActive, true))
  const activeCodes = new Set(activeLanguages.map((l) => l.code))

  const urls: SitemapUrl[] = []

  const publishedPages = await db.select().from(pages).where(eq(pages.status, 'published'))
  for (const page of publishedPages) {
    const paths: Record<string, string> = {}
    for (const [code, slug] of Object.entries(page.slug)) {
      if (!activeCodes.has(code) || page.seo[code]?.noindex) continue
      paths[code] = slug ? `/${slug}` : '/'
    }
    if (Object.keys(paths).length) urls.push({ paths, lastmod: page.updatedAt })
  }

  const allServices = await db.select().from(services)
  for (const service of allServices) {
    const paths = Object.fromEntries(
      Object.entries(service.slug)
        .filter(([code, slug]) => activeCodes.has(code) && slug)
        .map(([code, slug]) => [code, `/services/${slug}`]),
    )
    if (Object.keys(paths).length) urls.push({ paths, lastmod: service.updatedAt })
  }

  const allLocations = await db.select().from(locations)
  for (const location of allLocations) {
    const paths = Object.fromEntries(
      Object.entries(location.slug)
        .filter(([code, slug]) => activeCodes.has(code) && slug)
        .map(([code, slug]) => [code, `/branches/${slug}`]),
    )
    if (Object.keys(paths).length) urls.push({ paths, lastmod: location.updatedAt })
  }

  const allPosts = await db.select().from(blogPosts)
  for (const post of allPosts) {
    const paths = Object.fromEntries(
      Object.entries(post.slug)
        .filter(([code, slug]) => activeCodes.has(code) && slug && post.publishedByLocale[code])
        .map(([code, slug]) => [code, `/blog/${slug}`]),
    )
    if (Object.keys(paths).length) urls.push({ paths, lastmod: post.updatedAt })
  }

  return urls
}
