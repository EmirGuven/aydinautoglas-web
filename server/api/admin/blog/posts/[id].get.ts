import { getBlogPostById } from '../../../../services/blog.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })
  try {
    return await getBlogPostById(id)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
  }
})
