import { and, eq, sql } from 'drizzle-orm'
import DOMPurify from 'isomorphic-dompurify'
import { db } from '../db/client'
import { pageBlocks, pages } from '../db/schema'
import type { CreatePageInput, UpdatePageInput } from '../../shared/schemas/pages'
import type { Block } from '../../shared/schemas/blocks'
import { blockSchema } from '../../shared/schemas/blocks'
import { ForbiddenError } from '../utils/permissions'
import { recordSlugChangeRedirects } from './redirects.service'

/** Rich text arrives as HTML (from the TipTap editor) and must be sanitized before it is ever persisted. */
const RICH_TEXT_FIELDS_BY_TYPE: Partial<Record<Block['type'], string[]>> = {
  'rich-text': ['content'],
  'image-text': ['text'],
}

function sanitizeRichTextFields(type: Block['type'], data: Record<string, unknown>): Record<string, unknown> {
  const fields = RICH_TEXT_FIELDS_BY_TYPE[type]
  if (!fields) return data

  const sanitized = { ...data }
  for (const field of fields) {
    const value = sanitized[field]
    if (value && typeof value === 'object') {
      sanitized[field] = Object.fromEntries(
        Object.entries(value as Record<string, string>).map(([locale, html]) => [locale, DOMPurify.sanitize(html)]),
      )
    }
  }
  return sanitized
}

export async function listPages() {
  return db.select().from(pages).orderBy(pages.createdAt)
}

export async function getPageById(id: string) {
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page) throw new Error('Page not found')
  const blocks = await db.select().from(pageBlocks).where(eq(pageBlocks.pageId, id)).orderBy(pageBlocks.sortOrder)
  return { ...page, blocks }
}

async function assertSlugAvailable(locale: string, slug: string, excludePageId?: string) {
  const rows = await db.select({ id: pages.id, slug: pages.slug }).from(pages)
  const taken = rows.some((row) => row.id !== excludePageId && row.slug[locale] === slug)
  if (taken) {
    throw new ForbiddenError(`Slug "${slug}" is already used for locale "${locale}"`)
  }
}

export async function createPage(input: CreatePageInput) {
  for (const [locale, slug] of Object.entries(input.slug)) {
    await assertSlugAvailable(locale, slug)
  }

  const [created] = await db
    .insert(pages)
    .values({
      slug: input.slug,
      title: input.title,
      seo: input.seo,
    })
    .returning()

  if (!created) throw new Error('Page insert did not return a row')
  return created
}

export async function updatePage(id: string, input: UpdatePageInput) {
  let previousSlug: Record<string, string> | undefined
  if (input.slug) {
    for (const [locale, slug] of Object.entries(input.slug)) {
      await assertSlugAvailable(locale, slug, id)
    }
    previousSlug = (await getPageById(id)).slug
  }

  const values: Partial<typeof pages.$inferInsert> = { updatedAt: new Date() }
  if (input.slug !== undefined) values.slug = input.slug
  if (input.title !== undefined) values.title = input.title
  if (input.seo !== undefined) values.seo = input.seo
  if (input.status !== undefined) values.status = input.status

  const [updated] = await db.update(pages).set(values).where(eq(pages.id, id)).returning()
  if (!updated) throw new Error('Page not found')
  if (input.slug) {
    await recordSlugChangeRedirects(previousSlug, input.slug, (_locale, slug) => (slug ? `/${slug}` : '/'))
  }
  return updated
}

export async function deletePage(id: string) {
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (page?.isSystemPage) {
    throw new ForbiddenError('System pages cannot be deleted')
  }
  await db.delete(pages).where(eq(pages.id, id))
}

export async function createBlock(pageId: string, block: Block) {
  const siblings = await db.select().from(pageBlocks).where(eq(pageBlocks.pageId, pageId))
  const [created] = await db
    .insert(pageBlocks)
    .values({
      pageId,
      type: block.type,
      data: sanitizeRichTextFields(block.type, block.data),
      sortOrder: siblings.length,
    })
    .returning()
  if (!created) throw new Error('Block insert did not return a row')
  return created
}

export async function getBlockById(blockId: string) {
  const [row] = await db.select().from(pageBlocks).where(eq(pageBlocks.id, blockId)).limit(1)
  if (!row) throw new Error('Block not found')
  return row
}

export async function updateBlock(blockId: string, type: Block['type'], data: Record<string, unknown>, isVisible?: boolean) {
  const values: Partial<typeof pageBlocks.$inferInsert> = { data: sanitizeRichTextFields(type, data) }
  if (isVisible !== undefined) values.isVisible = isVisible
  const [updated] = await db.update(pageBlocks).set(values).where(eq(pageBlocks.id, blockId)).returning()
  if (!updated) throw new Error('Block not found')
  return updated
}

export async function deleteBlock(blockId: string) {
  await db.delete(pageBlocks).where(eq(pageBlocks.id, blockId))
}

export async function reorderBlocks(pageId: string, orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(pageBlocks)
        .set({ sortOrder: index })
        .where(and(eq(pageBlocks.id, id), eq(pageBlocks.pageId, pageId))),
    ),
  )
}

/** Public read: a published page by locale-specific slug, with invalid/unknown blocks safely dropped. */
export async function getPublishedPageBySlug(locale: string, slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.status, 'published'), sql`${pages.slug} ->> ${locale} = ${slug}`))
    .limit(1)

  if (!page) return null

  const rawBlocks = await db
    .select()
    .from(pageBlocks)
    .where(and(eq(pageBlocks.pageId, page.id), eq(pageBlocks.isVisible, true)))
    .orderBy(pageBlocks.sortOrder)

  const blocks: Block[] = []
  for (const row of rawBlocks) {
    const parsed = blockSchema.safeParse({ type: row.type, data: row.data })
    if (parsed.success) {
      blocks.push(parsed.data)
    } else {
      console.warn(`[pages] skipping invalid block ${row.id} (type=${row.type}) on page ${page.id}`)
    }
  }

  return { page, blocks }
}
