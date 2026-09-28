import { boolean, integer, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: jsonb('slug').notNull().$type<Record<string, string>>(),
  title: jsonb('title').notNull().$type<Record<string, string>>(),
  shortDescription: jsonb('short_description').notNull().$type<Record<string, string>>().default({}),
  content: jsonb('content').notNull().$type<Record<string, string>>().default({}),
  iconOrMediaId: uuid('icon_or_media_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  /** 2-3 sentence direct-answer summary shown at the top of the service page (prompt.md §15.4). */
  shortAnswer: jsonb('short_answer').notNull().$type<Record<string, string>>().default({}),
  /** Starting price in EUR cents (e.g. 4900 = "ab 49,00 €"); null = not shown. */
  priceFromCents: integer('price_from_cents'),
  /** Average job duration in minutes; null = not shown. */
  durationMinutes: integer('duration_minutes'),
  warranty: jsonb('warranty').notNull().$type<Record<string, string>>().default({}),
  insuranceInfo: jsonb('insurance_info').notNull().$type<Record<string, string>>().default({}),
  seo: jsonb('seo')
    .notNull()
    .$type<Record<string, { metaTitle?: string; metaDescription?: string; noindex?: boolean; focusKeyword?: string }>>()
    .default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
