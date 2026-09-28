import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * Every public-facing 404 hit is upserted here (path unique, hitCount incremented) so an
 * admin can see which broken/missing URLs are actually being requested and turn the
 * high-traffic ones into a redirect with one click (see prompt.md §15.1).
 */
export const notFoundLogs = pgTable('not_found_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  path: varchar('path', { length: 500 }).notNull().unique(),
  hitCount: integer('hit_count').notNull().default(1),
  firstSeenAt: timestamp('first_seen_at').notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
})
