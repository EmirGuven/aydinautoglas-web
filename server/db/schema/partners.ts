import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  logoMediaId: uuid('logo_media_id').notNull(),
  websiteUrl: varchar('website_url', { length: 500 }),
  sortOrder: integer('sort_order').notNull().default(0),
})
