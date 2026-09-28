import { themeSchema } from '../../../shared/schemas/theme'
import { setTheme } from '../../services/theme.service'
import { requireSessionWithRole } from '../../utils/session'
import { recordAuditLog } from '../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'admin')
  const body = await readBody(event)
  const parsed = themeSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  const updated = await setTheme(parsed.data)
  await recordAuditLog({ userId: session.sub, action: 'theme.update', entityType: 'theme', entityId: 'default' })
  return updated
})
