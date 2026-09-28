import { getAllSettings } from '../../../services/site-settings.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  return getAllSettings()
})
