import { boolean, integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const pageStatusEnum = pgEnum('page_status', ['draft', 'published'])

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** { de: "startseite", en: "home", tr: "anasayfa" } */
  slug: jsonb('slug').notNull().$type<Record<string, string>>(),
  title: jsonb('title').notNull().$type<Record<string, string>>(),
  seo: jsonb('seo')
    .notNull()
    .$type<
      Record<
        string,
        {
          metaTitle?: string
          metaDescription?: string
          ogImageMediaId?: string
          noindex?: boolean
          /** 2-3 sentence direct-answer summary shown at the top of the page, for AI/GEO crawlers (prompt.md §15.4). */
          shortAnswer?: string
          /** Primary keyword this page targets — surfaced in the admin SEO checklist, not rendered publicly. */
          focusKeyword?: string
        }
      >
    >()
    .default({}),
  status: pageStatusEnum('status').notNull().default('draft'),
  /** Legal pages (Impressum, Datenschutz, ...) can't be deleted from the admin UI. */
  isSystemPage: boolean('is_system_page').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const pageBlocks = pgTable('page_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id')
    .notNull()
    .references(() => pages.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  /** Validated against shared/schemas/blocks/index.ts blockSchema before write. */
  data: jsonb('data').notNull().$type<Record<string, unknown>>(),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
})
