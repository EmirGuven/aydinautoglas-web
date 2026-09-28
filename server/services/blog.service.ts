import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { blogCategories, blogPosts } from '../db/schema'
import type { BlogCategoryInput, BlogPostInput } from '../../shared/schemas/blog'
import { ForbiddenError } from '../utils/permissions'
import { sanitizeTranslatableHtml } from '../utils/sanitize-rich-text'
import { recordSlugChangeRedirects } from './redirects.service'

// Categories
export async function listBlogCategories() {
  return db.select().from(blogCategories)
}

export async function createBlogCategory(input: BlogCategoryInput) {
  const [created] = await db.insert(blogCategories).values(input).returning()
  if (!created) throw new Error('Blog category insert did not return a row')
  return created
}

export async function updateBlogCategory(id: string, input: Partial<BlogCategoryInput>) {
  const [updated] = await db.update(blogCategories).set(input).where(eq(blogCategories.id, id)).returning()
  if (!updated) throw new Error('Blog category not found')
  return updated
}

export async function deleteBlogCategory(id: string) {
  await db.delete(blogCategories).where(eq(blogCategories.id, id))
}

// Posts
async function assertSlugAvailable(locale: string, slug: string, excludeId?: string) {
  const rows = await db.select({ id: blogPosts.id, slug: blogPosts.slug }).from(blogPosts)
  const taken = rows.some((row) => row.id !== excludeId && row.slug[locale] === slug)
  if (taken) throw new ForbiddenError(`Slug "${slug}" is already used for locale "${locale}"`)
}

export async function listBlogPosts() {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt))
}

export async function getBlogPostById(id: string) {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)
  if (!row) throw new Error('Blog post not found')
  return row
}

export async function createBlogPost(input: BlogPostInput) {
  for (const [locale, slug] of Object.entries(input.slug)) {
    await assertSlugAvailable(locale, slug)
  }
  const values: Partial<typeof blogPosts.$inferInsert> = { ...input, content: sanitizeTranslatableHtml(input.content) }
  if (Object.values(input.publishedByLocale).some(Boolean)) {
    values.publishedAt = new Date()
  }
  const [created] = await db.insert(blogPosts).values(values as typeof blogPosts.$inferInsert).returning()
  if (!created) throw new Error('Blog post insert did not return a row')
  return created
}

export async function updateBlogPost(id: string, input: Partial<BlogPostInput>) {
  let previousSlug: Record<string, string> | undefined
  if (input.slug) {
    for (const [locale, slug] of Object.entries(input.slug)) {
      await assertSlugAvailable(locale, slug, id)
    }
    previousSlug = (await getBlogPostById(id)).slug
  }
  const values: Partial<typeof blogPosts.$inferInsert> = { ...input, updatedAt: new Date() }
  if (input.content) values.content = sanitizeTranslatableHtml(input.content)
  if (input.publishedByLocale && Object.values(input.publishedByLocale).some(Boolean)) {
    const existing = await getBlogPostById(id)
    if (!existing.publishedAt) values.publishedAt = new Date()
  }
  const [updated] = await db.update(blogPosts).set(values).where(eq(blogPosts.id, id)).returning()
  if (!updated) throw new Error('Blog post not found')
  if (input.slug) {
    await recordSlugChangeRedirects(previousSlug, input.slug, (_locale, slug) => `/blog/${slug}`)
  }
  return updated
}

export async function deleteBlogPost(id: string) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
}

export async function getPublishedBlogPostBySlug(locale: string, slug: string) {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(sql`${blogPosts.slug} ->> ${locale} = ${slug}`)
    .limit(1)
  if (!row || !row.publishedByLocale[locale]) return null
  return row
}
