import { listRedirects } from '../../../services/redirects.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listRedirects()
})
