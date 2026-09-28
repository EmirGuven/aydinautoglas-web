import { damageWizardQuestionInputSchema } from '#shared/schemas/damage-wizard'
import { createQuestion } from '../../../../services/damage-wizard.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = damageWizardQuestionInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  setResponseStatus(event, 201)
  return createQuestion(parsed.data)
})
