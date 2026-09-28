import { integer, jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorPhotoMediaId: uuid('author_photo_media_id'),
  rating: integer('rating').notNull().default(5),
  text: jsonb('text').notNull().$type<Record<string, string>>(),
  sortOrder: integer('sort_order').notNull().default(0),
})
