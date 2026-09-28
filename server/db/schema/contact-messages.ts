import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  message: text('message').notNull(),
  locale: varchar('locale', { length: 10 }).notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
