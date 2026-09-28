import { listFaqCategories } from '../../../../services/faqs.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listFaqCategories()
})
