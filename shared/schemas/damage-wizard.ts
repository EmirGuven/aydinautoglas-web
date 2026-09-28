import { z } from 'zod'
import { translatableText } from './i18n'

export const damageWizardQuestionInputSchema = z.object({
  text: translatableText(),
})

export const damageWizardOptionInputSchema = z.object({
  questionId: z.string().uuid(),
  label: translatableText(),
  /** Contributes to the total severity score used by rules to pick repair vs. replace. */
  score: z.number().int().min(0).max(100).default(0),
})

export const damageWizardRuleInputSchema = z.object({
  /** This rule applies when the summed answer score is >= minScore. Rules are evaluated highest minScore first. */
  minScore: z.number().int().min(0),
  recommendation: z.enum(['repair', 'replace']),
  message: translatableText(),
})

export type DamageWizardQuestionInput = z.infer<typeof damageWizardQuestionInputSchema>
export type DamageWizardOptionInput = z.infer<typeof damageWizardOptionInputSchema>
export type DamageWizardRuleInput = z.infer<typeof damageWizardRuleInputSchema>

export const damageWizardAnswerSchema = z.array(
  z.object({ questionId: z.string().uuid(), optionId: z.string().uuid() }),
)
export type DamageWizardAnswers = z.infer<typeof damageWizardAnswerSchema>
