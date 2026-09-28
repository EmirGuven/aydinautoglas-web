import { deleteBlogCategory } from '../../../../services/blog.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  await deleteBlogCategory(id)
  return { success: true }
})
