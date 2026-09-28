import { listServicesForBlock } from '../../services/content-read.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 6
  const onlyFeatured = query.onlyFeatured === 'true'
  return listServicesForBlock(limit, onlyFeatured)
})
