import { deleteLanguage } from '../../../services/languages.service'
import { requireSessionWithRole } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'admin')
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing language code' })
  }

  try {
    await deleteLanguage(code)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    throw error
  }

  await recordAuditLog({ userId: session.sub, action: 'language.delete', entityType: 'language', entityId: code })
  return { success: true }
})
