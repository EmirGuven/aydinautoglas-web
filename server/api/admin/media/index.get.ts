import { listMedia } from '../../../services/media.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search : undefined
  return listMedia(search)
})
