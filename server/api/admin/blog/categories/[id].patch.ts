import { blogCategoryInputSchema } from '#shared/schemas/blog'
import { updateBlogCategory } from '../../../../services/blog.service'
import { requireSessionWithRole } from '../../../../utils/session'
import { keysActuallySent } from '../../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  const body = await readBody(event)
  const parsed = blogCategoryInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateBlogCategory(id, keysActuallySent(parsed.data, body))
})
