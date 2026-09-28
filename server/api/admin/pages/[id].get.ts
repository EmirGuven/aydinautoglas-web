import { getPageById } from '../../../services/pages.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing page id' })

  try {
    return await getPageById(id)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
})
