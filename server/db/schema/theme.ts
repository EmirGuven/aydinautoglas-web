import { pgTable, varchar } from 'drizzle-orm/pg-core'

/**
 * A single-row table (id is always 'default') holding the live theme.
 * Values are printed into a SSR <style>:root{...}</style> block, see
 * app/composables/useTheme.ts.
 */
export const theme = pgTable('theme', {
  id: varchar('id', { length: 20 }).primaryKey().default('default'),
  colorPrimary: varchar('color_primary', { length: 20 }).notNull().default('#1d4ed8'),
  colorSecondary: varchar('color_secondary', { length: 20 }).notNull().default('#0f172a'),
  colorAccent: varchar('color_accent', { length: 20 }).notNull().default('#f59e0b'),
  colorBackground: varchar('color_background', { length: 20 }).notNull().default('#ffffff'),
  colorText: varchar('color_text', { length: 20 }).notNull().default('#0f172a'),
  fontFamily: varchar('font_family', { length: 255 }).notNull().default('system-ui, sans-serif'),
  borderRadius: varchar('border_radius', { length: 20 }).notNull().default('0.5rem'),
  buttonStyle: varchar('button_style', { length: 20 }).notNull().default('solid'),
})
