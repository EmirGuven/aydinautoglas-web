import { damageWizardRuleInputSchema } from '#shared/schemas/damage-wizard'
import { updateRule } from '../../../../services/damage-wizard.service'
import { requireSessionWithRole } from '../../../../utils/session'
import { keysActuallySent } from '../../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing rule id' })
  const body = await readBody(event)
  const parsed = damageWizardRuleInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateRule(id, keysActuallySent(parsed.data, body))
})
