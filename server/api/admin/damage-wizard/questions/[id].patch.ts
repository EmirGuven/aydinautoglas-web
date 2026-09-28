import { damageWizardQuestionInputSchema } from '#shared/schemas/damage-wizard'
import { updateQuestion } from '../../../../services/damage-wizard.service'
import { requireSessionWithRole } from '../../../../utils/session'
import { keysActuallySent } from '../../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing question id' })
  const body = await readBody(event)
  const parsed = damageWizardQuestionInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateQuestion(id, keysActuallySent(parsed.data, body))
})
