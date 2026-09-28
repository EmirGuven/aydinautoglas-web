import { listTranslations } from '../../../services/translations.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listTranslations()
})
