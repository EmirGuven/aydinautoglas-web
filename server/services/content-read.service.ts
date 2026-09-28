import { desc } from 'drizzle-orm'
import { db } from '../db/client'
import { blogPosts, faqCategories, faqs, locations, partners, services, testimonials } from '../db/schema'

/**
 * Thin read-only queries backing the "pulls live data" page-builder blocks
 * (service-cards, testimonials, partners, branch-finder, faq-accordion,
 * blog-preview). Full admin CRUD for these tables lands in Phase 5; until
 * then these tables are simply empty and the blocks render nothing.
 */

export async function listServicesForBlock(limit: number, onlyFeatured: boolean) {
  const rows = await db.select().from(services).orderBy(services.sortOrder).limit(limit)
  return onlyFeatured ? rows.filter((r) => r.isFeatured) : rows
}

export async function listTestimonialsForBlock(limit: number) {
  return db.select().from(testimonials).orderBy(testimonials.sortOrder).limit(limit)
}

export async function listPartnersForBlock() {
  return db.select().from(partners).orderBy(partners.sortOrder)
}

export async function listLocationsForBlock() {
  return db.select().from(locations)
}

export async function listFaqsForBlock(categoryId?: string) {
  const rows = await db.select().from(faqs).orderBy(faqs.sortOrder)
  return categoryId ? rows.filter((r) => r.categoryId === categoryId) : rows
}

export async function listFaqCategoriesForBlock() {
  return db.select().from(faqCategories).orderBy(faqCategories.sortOrder)
}

export async function listPublishedBlogPostsForBlock(locale: string, limit: number) {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt)).limit(limit * 3)
  return rows.filter((r) => r.publishedByLocale[locale]).slice(0, limit)
}
