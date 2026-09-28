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
  colorSurface: varchar('color_surface', { length: 20 }).notNull().default('#ffffff'),
  colorBorder: varchar('color_border', { length: 20 }).notNull().default('#e2e8f0'),
  colorMuted: varchar('color_muted', { length: 20 }).notNull().default('#64748b'),
  fontFamily: varchar('font_family', { length: 255 }).notNull().default('system-ui, sans-serif'),
  fontFamilyHeading: varchar('font_family_heading', { length: 255 }).notNull().default('system-ui, sans-serif'),
  borderRadius: varchar('border_radius', { length: 20 }).notNull().default('0.5rem'),
  radiusCard: varchar('radius_card', { length: 20 }).notNull().default('0.5rem'),
  shadowCard: varchar('shadow_card', { length: 255 }).notNull().default('0 1px 2px rgba(15, 23, 42, 0.08)'),
  shadowElevated: varchar('shadow_elevated', { length: 255 }).notNull().default('0 12px 28px rgba(15, 23, 42, 0.18)'),
  buttonStyle: varchar('button_style', { length: 20 }).notNull().default('solid'),
})
