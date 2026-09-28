import { integer, jsonb, pgTable, uuid } from 'drizzle-orm/pg-core'

/**
 * Skeleton for Phase 6. The wizard (question -> options -> result rule)
 * is fully admin-configurable so it can be reused for other sectors as a
 * generic "needs assessment wizard" (prompt.md §5).
 */
export const damageWizardQuestions = pgTable('damage_wizard_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: jsonb('text').notNull().$type<Record<string, string>>(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const damageWizardOptions = pgTable('damage_wizard_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => damageWizardQuestions.id, { onDelete: 'cascade' }),
  label: jsonb('label').notNull().$type<Record<string, string>>(),
  value: jsonb('value').notNull().$type<Record<string, unknown>>(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const damageWizardRules = pgTable('damage_wizard_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Condition against collected answers, evaluated in server/services/damage-wizard.service.ts (Phase 6). */
  condition: jsonb('condition').notNull().$type<Record<string, unknown>>(),
  result: jsonb('result').notNull().$type<{ recommendation: 'repair' | 'replace'; message: Record<string, string> }>(),
  sortOrder: integer('sort_order').notNull().default(0),
})
