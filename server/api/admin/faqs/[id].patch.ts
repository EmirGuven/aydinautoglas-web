import { faqInputSchema } from '#shared/schemas/faqs'
import { updateFaq } from '../../../services/faqs.service'
import { requireSessionWithRole } from '../../../utils/session'
import { keysActuallySent } from '../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing FAQ id' })
  const body = await readBody(event)
  const parsed = faqInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateFaq(id, keysActuallySent(parsed.data, body))
})
