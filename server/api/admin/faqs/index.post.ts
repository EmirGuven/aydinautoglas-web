import { faqInputSchema } from '#shared/schemas/faqs'
import { createFaq } from '../../../services/faqs.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = faqInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  setResponseStatus(event, 201)
  return createFaq(parsed.data)
})
