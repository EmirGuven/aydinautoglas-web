import { deleteFaqCategory } from '../../../../services/faqs.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  await deleteFaqCategory(id)
  return { success: true }
})
