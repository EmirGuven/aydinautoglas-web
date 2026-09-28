import { buildSeoReport } from '../../../services/seo-report.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return buildSeoReport()
})
