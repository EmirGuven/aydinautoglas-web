import { randomUUID } from 'node:crypto'
import { siteSettingsSchemas, type SiteSettingsKey } from '../../../../shared/schemas/site-settings'
import { setSetting } from '../../../services/site-settings.service'
import { requireSessionWithRole } from '../../../utils/session'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'admin')
  const key = getRouterParam(event, 'key') as SiteSettingsKey

  const schema = siteSettingsSchemas[key]
  if (!schema) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown settings key' })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  // IndexNow needs a key before it can be enabled — auto-generate one the first time an
  // admin flips it on without having set one (see server/services/indexnow.service.ts).
  if (key === 'indexNow') {
    const data = parsed.data as { enabled: boolean; key: string }
    if (data.enabled && !data.key) {
      data.key = randomUUID().replace(/-/g, '')
    }
  }

  await setSetting(key, parsed.data)
  await recordAuditLog({
    userId: session.sub,
    action: 'settings.update',
    entityType: 'site_settings',
    entityId: key,
  })

  return { success: true }
})
