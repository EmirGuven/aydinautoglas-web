import { partnerInputSchema } from '#shared/schemas/partners'
import { updatePartner } from '../../../services/partners.service'
import { requireSessionWithRole } from '../../../utils/session'
import { keysActuallySent } from '../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing partner id' })
  const body = await readBody(event)
  const parsed = partnerInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updatePartner(id, keysActuallySent(parsed.data, body))
})
