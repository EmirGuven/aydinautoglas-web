import { damageWizardAnswerSchema } from '#shared/schemas/damage-wizard'
import { evaluateAnswers } from '../../services/damage-wizard.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = damageWizardAnswerSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return evaluateAnswers(parsed.data)
})
