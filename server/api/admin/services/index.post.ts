import { serviceInputSchema } from '#shared/schemas/services'
import { createService } from '../../../services/services.service'
import { requireSessionWithRole } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'
import { pingIndexNow } from '../../../services/indexnow.service'
import { getDefaultLocaleCode, withLocalePrefix } from '../../../utils/locale-paths'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = serviceInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    setResponseStatus(event, 201)
    const created = await createService(parsed.data)

    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const defaultCode = await getDefaultLocaleCode()
    const urls = Object.entries(created.slug).map(
      ([locale, slug]) => `${origin}${withLocalePrefix(`/services/${slug}`, locale, defaultCode)}`,
    )
    await pingIndexNow(origin, urls)

    return created
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 409, statusMessage: error.message })
    }
    throw error
  }
})
