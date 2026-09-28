import { deleteTranslation } from '../../../services/translations.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Missing translation key' })
  await deleteTranslation(key)
  return { success: true }
})
