import { damageWizardRuleInputSchema } from '#shared/schemas/damage-wizard'
import { createRule } from '../../../../services/damage-wizard.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = damageWizardRuleInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  setResponseStatus(event, 201)
  return createRule(parsed.data)
})
