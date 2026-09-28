import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { damageWizardOptions, damageWizardQuestions, damageWizardRules } from '../db/schema'
import type {
  DamageWizardAnswers,
  DamageWizardOptionInput,
  DamageWizardQuestionInput,
  DamageWizardRuleInput,
} from '../../shared/schemas/damage-wizard'

// Questions
export async function listQuestions() {
  return db.select().from(damageWizardQuestions).orderBy(damageWizardQuestions.sortOrder)
}

export async function createQuestion(input: DamageWizardQuestionInput) {
  const siblings = await db.select({ id: damageWizardQuestions.id }).from(damageWizardQuestions)
  const [created] = await db
    .insert(damageWizardQuestions)
    .values({ text: input.text, sortOrder: siblings.length })
    .returning()
  if (!created) throw new Error('Question insert did not return a row')
  return created
}

export async function updateQuestion(id: string, input: Partial<DamageWizardQuestionInput>) {
  const [updated] = await db.update(damageWizardQuestions).set(input).where(eq(damageWizardQuestions.id, id)).returning()
  if (!updated) throw new Error('Question not found')
  return updated
}

export async function deleteQuestion(id: string) {
  await db.delete(damageWizardQuestions).where(eq(damageWizardQuestions.id, id))
}

// Options
export async function listOptionsForQuestion(questionId: string) {
  return db.select().from(damageWizardOptions).where(eq(damageWizardOptions.questionId, questionId))
}

export async function createOption(input: DamageWizardOptionInput) {
  const siblings = await db
    .select({ id: damageWizardOptions.id })
    .from(damageWizardOptions)
    .where(eq(damageWizardOptions.questionId, input.questionId))
  const [created] = await db
    .insert(damageWizardOptions)
    .values({
      questionId: input.questionId,
      label: input.label,
      value: { score: input.score },
      sortOrder: siblings.length,
    })
    .returning()
  if (!created) throw new Error('Option insert did not return a row')
  return created
}

export async function updateOption(id: string, input: Partial<DamageWizardOptionInput>) {
  const values: Partial<typeof damageWizardOptions.$inferInsert> = {}
  if (input.label !== undefined) values.label = input.label
  if (input.score !== undefined) values.value = { score: input.score }
  const [updated] = await db.update(damageWizardOptions).set(values).where(eq(damageWizardOptions.id, id)).returning()
  if (!updated) throw new Error('Option not found')
  return updated
}

export async function deleteOption(id: string) {
  await db.delete(damageWizardOptions).where(eq(damageWizardOptions.id, id))
}

// Rules
export async function listRules() {
  return db.select().from(damageWizardRules)
}

export async function createRule(input: DamageWizardRuleInput) {
  const [created] = await db
    .insert(damageWizardRules)
    .values({
      condition: { minScore: input.minScore },
      result: { recommendation: input.recommendation, message: input.message },
    })
    .returning()
  if (!created) throw new Error('Rule insert did not return a row')
  return created
}

export async function updateRule(id: string, input: Partial<DamageWizardRuleInput>) {
  const values: Partial<typeof damageWizardRules.$inferInsert> = {}
  if (input.minScore !== undefined) values.condition = { minScore: input.minScore }
  if (input.recommendation !== undefined || input.message !== undefined) {
    const [existing] = await db.select().from(damageWizardRules).where(eq(damageWizardRules.id, id)).limit(1)
    values.result = {
      recommendation: input.recommendation ?? existing?.result.recommendation ?? 'repair',
      message: input.message ?? existing?.result.message ?? {},
    }
  }
  const [updated] = await db.update(damageWizardRules).set(values).where(eq(damageWizardRules.id, id)).returning()
  if (!updated) throw new Error('Rule not found')
  return updated
}

export async function deleteRule(id: string) {
  await db.delete(damageWizardRules).where(eq(damageWizardRules.id, id))
}

// Public
export async function getWizardConfig() {
  const questions = await db.select().from(damageWizardQuestions).orderBy(damageWizardQuestions.sortOrder)
  const options = await db.select().from(damageWizardOptions)
  return questions.map((question) => ({
    ...question,
    options: options.filter((o) => o.questionId === question.id),
  }))
}

export async function evaluateAnswers(answers: DamageWizardAnswers) {
  const optionIds = answers.map((a) => a.optionId)
  const options = optionIds.length
    ? await db.select().from(damageWizardOptions)
    : []
  const totalScore = options
    .filter((o) => optionIds.includes(o.id))
    .reduce((sum, o) => sum + (Number((o.value as { score?: number }).score) || 0), 0)

  const rules = await db.select().from(damageWizardRules)
  const sorted = [...rules].sort((a, b) => (b.condition as { minScore: number }).minScore - (a.condition as { minScore: number }).minScore)
  const matched = sorted.find((rule) => totalScore >= (rule.condition as { minScore: number }).minScore)

  return {
    totalScore,
    recommendation: matched?.result.recommendation ?? 'repair',
    message: matched?.result.message ?? {},
  }
}
