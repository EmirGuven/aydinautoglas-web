import { blogPostInputSchema } from '#shared/schemas/blog'
import { updateBlogPost } from '../../../../services/blog.service'
import { requireSessionWithRole } from '../../../../utils/session'
import { keysActuallySent } from '../../../../utils/partial-update'
import { ForbiddenError } from '../../../../utils/permissions'
import { pingIndexNow } from '../../../../services/indexnow.service'
import { getDefaultLocaleCode, withLocalePrefix } from '../../../../utils/locale-paths'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })
  const body = await readBody(event)
  const parsed = blogPostInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  try {
    const updated = await updateBlogPost(id, keysActuallySent(parsed.data, body))

    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const defaultCode = await getDefaultLocaleCode()
    const urls = Object.entries(updated.slug)
      .filter(([locale]) => updated.publishedByLocale[locale])
      .map(([locale, slug]) => `${origin}${withLocalePrefix(`/blog/${slug}`, locale, defaultCode)}`)
    await pingIndexNow(origin, urls)

    return updated
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 409, statusMessage: error.message })
    }
    throw error
  }
})
