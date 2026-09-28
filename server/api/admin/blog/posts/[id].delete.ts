import { deleteBlogPost } from '../../../../services/blog.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })
  await deleteBlogPost(id)
  return { success: true }
})
