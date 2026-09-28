import { getLocationBySlug } from '../../services/locations.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const locale = typeof getQuery(event).locale === 'string' ? (getQuery(event).locale as string) : 'de'
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const location = await getLocationBySlug(locale, slug)
  if (!location) throw createError({ statusCode: 404, statusMessage: 'Location not found' })
  return location
})
