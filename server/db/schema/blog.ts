import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: jsonb('slug').notNull().$type<Record<string, string>>(),
  name: jsonb('name').notNull().$type<Record<string, string>>(),
})

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  slug: jsonb('slug').notNull().$type<Record<string, string>>(),
  title: jsonb('title').notNull().$type<Record<string, string>>(),
  excerpt: jsonb('excerpt').notNull().$type<Record<string, string>>().default({}),
  content: jsonb('content').notNull().$type<Record<string, string>>().default({}),
  coverMediaId: uuid('cover_media_id'),
  /** A post can be published in only some languages, e.g. { de: true, en: false }. */
  publishedByLocale: jsonb('published_by_locale').notNull().$type<Record<string, boolean>>().default({}),
  publishedAt: timestamp('published_at'),
  /** E-E-A-T author byline (prompt.md §15.4) — name is not translatable, role/title is. */
  authorName: varchar('author_name', { length: 255 }),
  authorRole: jsonb('author_role').notNull().$type<Record<string, string>>().default({}),
  authorPhotoMediaId: uuid('author_photo_media_id'),
  shortAnswer: jsonb('short_answer').notNull().$type<Record<string, string>>().default({}),
  seo: jsonb('seo')
    .notNull()
    .$type<Record<string, { metaTitle?: string; metaDescription?: string; noindex?: boolean; focusKeyword?: string }>>()
    .default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
