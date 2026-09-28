import { listNotFoundLogs } from '../../../services/not-found-logs.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listNotFoundLogs()
})
