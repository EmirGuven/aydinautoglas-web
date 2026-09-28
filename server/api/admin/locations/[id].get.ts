import { getLocationById } from '../../../services/locations.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing location id' })
  try {
    return await getLocationById(id)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Location not found' })
  }
})
