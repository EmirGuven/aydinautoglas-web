import { updatePageSchema } from '../../../../shared/schemas/pages'
import { updatePage } from '../../../services/pages.service'
import { requireSessionWithRole } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'
import { recordAuditLog } from '../../../services/audit-log.service'
import { pingIndexNow } from '../../../services/indexnow.service'
import { getDefaultLocaleCode, withLocalePrefix } from '../../../utils/locale-paths'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing page id' })

  const body = await readBody(event)
  const parsed = updatePageSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    const updated = await updatePage(id, parsed.data)
    await recordAuditLog({ userId: session.sub, action: 'page.update', entityType: 'page', entityId: id })

    if (updated.status === 'published') {
      const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
      const defaultCode = await getDefaultLocaleCode()
      const urls = Object.entries(updated.slug)
        .filter(([, slug]) => slug !== undefined)
        .map(([locale, slug]) => `${origin}${withLocalePrefix(`/${slug}`, locale, defaultCode)}`)
      await pingIndexNow(origin, urls)
    }

    return updated
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 409, statusMessage: error.message })
    }
    throw error
  }
})
