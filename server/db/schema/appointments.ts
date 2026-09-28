import { jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'new',
  'contacted',
  'scheduled',
  'done',
  'cancelled',
])

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  /**
   * Form fields are admin-configurable (prompt.md §5), so submitted data is
   * kept as flexible JSON rather than fixed columns. Validated against the
   * currently configured form schema at submission time in the service layer.
   */
  formData: jsonb('form_data').notNull().$type<Record<string, unknown>>(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }),
  locale: varchar('locale', { length: 10 }).notNull(),
  status: appointmentStatusEnum('status').notNull().default('new'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
