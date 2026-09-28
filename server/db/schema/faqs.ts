import { integer, jsonb, pgTable, uuid } from 'drizzle-orm/pg-core'

export const faqCategories = pgTable('faq_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: jsonb('name').notNull().$type<Record<string, string>>(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => faqCategories.id, { onDelete: 'set null' }),
  question: jsonb('question').notNull().$type<Record<string, string>>(),
  answer: jsonb('answer').notNull().$type<Record<string, string>>(),
  sortOrder: integer('sort_order').notNull().default(0),
})
