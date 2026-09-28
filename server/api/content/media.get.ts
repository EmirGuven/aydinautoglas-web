import { getMediaByIds } from '../../services/media-read.service'

/** Public: GET /api/content/media?ids=uuid1,uuid2 — resolves media ids referenced by page blocks to their URLs. */
export default defineEventHandler(async (event) => {
  const idsParam = getQuery(event).ids
  const ids = typeof idsParam === 'string' ? idsParam.split(',').filter(Boolean) : []
  return getMediaByIds(ids)
})
