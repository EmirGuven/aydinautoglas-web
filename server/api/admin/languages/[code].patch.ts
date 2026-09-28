import { languageSchema } from '../../../../shared/schemas/languages'
import { updateLanguage } from '../../../services/languages.service'
import { requireSessionWithRole } from '../../../utils/session'
import { keysActuallySent } from '../../../utils/partial-update'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'admin')
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing language code' })
  }

  const body = await readBody(event)
  const parsed = languageSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  const updated = await updateLanguage(code, keysActuallySent(parsed.data, body))
  await recordAuditLog({
    userId: session.sub,
    action: 'language.update',
    entityType: 'language',
    entityId: code,
  })
  return updated
})
