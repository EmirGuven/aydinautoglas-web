import { listLocations } from '../../../services/locations.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listLocations()
})
