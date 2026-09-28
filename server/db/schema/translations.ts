import { jsonb, pgTable, varchar } from 'drizzle-orm/pg-core'

/**
 * UI translations (buttons, form errors, "Learn more", etc.). Locale files
 * in code (see app/i18n/locales/) are only fallback/default values; the
 * source of truth is this table, editable from the admin "Translations" screen.
 */
export const translations = pgTable('translations', {
  key: varchar('key', { length: 255 }).primaryKey(),
  /** e.g. { de: "Mehr erfahren", en: "Learn more", tr: "Daha fazla bilgi" } */
  values: jsonb('values').notNull().$type<Record<string, string>>().default({}),
  group: varchar('group', { length: 100 }).notNull().default('general'),
})
