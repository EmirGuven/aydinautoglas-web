import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const redirects = pgTable('redirects', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromPath: varchar('from_path', { length: 500 }).notNull().unique(),
  toPath: varchar('to_path', { length: 500 }).notNull(),
  statusCode: integer('status_code').notNull().default(301),
})
