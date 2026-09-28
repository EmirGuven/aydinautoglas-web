import { faqCategoryInputSchema } from '#shared/schemas/faqs'
import { updateFaqCategory } from '../../../../services/faqs.service'
import { requireSessionWithRole } from '../../../../utils/session'
import { keysActuallySent } from '../../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  const body = await readBody(event)
  const parsed = faqCategoryInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateFaqCategory(id, keysActuallySent(parsed.data, body))
})
