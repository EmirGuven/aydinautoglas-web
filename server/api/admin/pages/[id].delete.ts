import { deletePage } from '../../../services/pages.service'
import { requireSessionWithRole } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'admin')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing page id' })

  try {
    await deletePage(id)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    throw error
  }

  await recordAuditLog({ userId: session.sub, action: 'page.delete', entityType: 'page', entityId: id })
  return { success: true }
})
