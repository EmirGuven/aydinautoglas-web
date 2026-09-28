import { deleteNotFoundLog } from '../../../services/not-found-logs.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing log id' })
  await deleteNotFoundLog(id)
  return { success: true }
})
