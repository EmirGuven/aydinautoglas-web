import { foreignKey, integer, jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const menus = pgTable('menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** e.g. "header", "footer" */
  location: varchar('location', { length: 50 }).notNull(),
})

export const menuItems = pgTable(
  'menu_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    menuId: uuid('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    label: jsonb('label').notNull().$type<Record<string, string>>(),
    linkType: varchar('link_type', { length: 20 }).notNull().default('page'), // page | url | pageBySlug
    linkValue: varchar('link_value', { length: 500 }).notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'menu_items_parent_id_fk',
    }).onDelete('cascade'),
  ],
)
