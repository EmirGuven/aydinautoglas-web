import { integer, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Randomly generated on-disk filename, not the original filename (security). */
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  altText: jsonb('alt_text').notNull().$type<Record<string, string>>().default({}),
  /** { thumb: "/uploads/...", medium: "/uploads/...", large: "/uploads/..." } */
  sizes: jsonb('sizes').notNull().$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
