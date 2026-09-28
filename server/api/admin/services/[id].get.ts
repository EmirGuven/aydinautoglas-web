import { getServiceById } from '../../../services/services.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing service id' })
  try {
    return await getServiceById(id)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }
})
