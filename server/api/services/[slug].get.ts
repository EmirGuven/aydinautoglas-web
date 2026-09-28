import { getServiceBySlug } from '../../services/services.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const locale = typeof getQuery(event).locale === 'string' ? (getQuery(event).locale as string) : 'de'
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const service = await getServiceBySlug(locale, slug)
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  return service
})
