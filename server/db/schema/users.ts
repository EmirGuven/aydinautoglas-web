import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'editor'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('editor'),
  locale: varchar('locale', { length: 10 }).notNull().default('de'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
