import { deleteMedia, isMediaInUse } from '../../../services/media.service'
import { requireSessionWithRole } from '../../../utils/session'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing media id' })
  }

  const force = getQuery(event).force === 'true'
  if (!force && (await isMediaInUse(id))) {
    throw createError({ statusCode: 409, statusMessage: 'Media is still in use. Pass force=true to delete anyway.' })
  }

  await deleteMedia(id)
  await recordAuditLog({ userId: session.sub, action: 'media.delete', entityType: 'media', entityId: id })
  return { success: true }
})
