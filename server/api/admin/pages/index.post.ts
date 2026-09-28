import { createPageSchema } from '../../../../shared/schemas/pages'
import { createPage } from '../../../services/pages.service'
import { requireSessionWithRole } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = createPageSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    setResponseStatus(event, 201)
    const created = await createPage(parsed.data)
    await recordAuditLog({ userId: session.sub, action: 'page.create', entityType: 'page', entityId: created.id })
    return created
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 409, statusMessage: error.message })
    }
    throw error
  }
})
