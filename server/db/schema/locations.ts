import { jsonb, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: jsonb('slug').notNull().$type<Record<string, string>>().default({}),
  name: jsonb('name').notNull().$type<Record<string, string>>(),
  address: jsonb('address').notNull().$type<Record<string, string>>().default({}),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  latitude: numeric('latitude', { precision: 9, scale: 6 }),
  longitude: numeric('longitude', { precision: 9, scale: 6 }),
  /** { mon: "08:00-18:00", ... } */
  openingHours: jsonb('opening_hours').notNull().$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
