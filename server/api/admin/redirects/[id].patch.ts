import { redirectInputSchema } from '#shared/schemas/redirects'
import { updateRedirect } from '../../../services/redirects.service'
import { requireSessionWithRole } from '../../../utils/session'
import { keysActuallySent } from '../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing redirect id' })
  const body = await readBody(event)
  const parsed = redirectInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateRedirect(id, keysActuallySent(parsed.data, body))
})
