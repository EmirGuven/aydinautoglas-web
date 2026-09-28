import { deleteRedirect } from '../../../services/redirects.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing redirect id' })
  await deleteRedirect(id)
  return { success: true }
})
