import { getActiveTheme } from '../../services/theme.service'
import { requireSessionWithRole } from '../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return getActiveTheme()
})
