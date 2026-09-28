import { listPublishedBlogPostsForBlock } from '../../services/content-read.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : 'de'
  const limit = Number(query.limit) || 3
  return listPublishedBlogPostsForBlock(locale, limit)
})
