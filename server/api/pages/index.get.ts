import { getPublishedPageBySlug } from '../../services/pages.service'

/** Public page render endpoint. GET /api/pages?locale=de&slug=windshield-repair (slug="" for the homepage). */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : 'de'
  const slug = typeof query.slug === 'string' ? query.slug : ''

  const result = await getPublishedPageBySlug(locale, slug)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
  return result
})
