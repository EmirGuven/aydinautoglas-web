import { partnerInputSchema } from '#shared/schemas/partners'
import { createPartner } from '../../../services/partners.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = partnerInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  setResponseStatus(event, 201)
  return createPartner(parsed.data)
})
