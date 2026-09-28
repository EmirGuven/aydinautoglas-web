import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }),
  metadata: jsonb('metadata').notNull().$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
