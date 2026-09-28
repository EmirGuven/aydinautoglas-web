import { jsonb, pgTable, varchar } from 'drizzle-orm/pg-core'

/**
 * Key-value settings table so a new setting never requires a migration.
 * Keys correspond to `siteSettingsSchemas` in shared/schemas/site-settings.ts.
 */
export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
})
