import { listSectorTemplates } from '../../../services/sector-template.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  return listSectorTemplates()
})
