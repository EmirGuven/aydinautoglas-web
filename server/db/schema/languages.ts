import { boolean, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const languages = pgTable('languages', {
  code: varchar('code', { length: 10 }).primaryKey(),
  name: text('name').notNull(),
  nativeName: text('native_name').notNull(),
  flagEmoji: varchar('flag_emoji', { length: 8 }).notNull(),
  direction: varchar('direction', { length: 3 }).notNull().default('ltr'),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
})
