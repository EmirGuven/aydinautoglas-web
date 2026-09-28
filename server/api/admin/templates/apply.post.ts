import { applySectorTemplateSchema } from '#shared/schemas/sector-template'
import { applySectorTemplate } from '../../../services/sector-template.service'
import { requireSessionWithRole } from '../../../utils/session'
import { recordAuditLog } from '../../../services/audit-log.service'

/**
 * Destructive: replaces every content table (pages, services, branches, FAQs,
 * testimonials, damage wizard, menus, blog) with the chosen template's seed data,
 * after snapshotting the current content into `site_settings.lastTemplateBackup`.
 * Restricted to `owner` for that reason — see docs/how-to/add-a-sector-template.md.
 */
export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'owner')
  const body = await readBody(event)
  const parsed = applySectorTemplateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  await applySectorTemplate(parsed.data.template)
  await recordAuditLog({
    userId: session.sub,
    action: 'sector-template.apply',
    entityType: 'site_settings',
    entityId: parsed.data.template,
  })

  return { success: true }
})
