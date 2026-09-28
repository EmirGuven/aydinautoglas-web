import { translationInputSchema } from '#shared/schemas/translations'
import { upsertTranslation } from '../../../services/translations.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Missing translation key' })

  const body = await readBody(event)
  const parsed = translationInputSchema.safeParse({ ...body, key })
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return upsertTranslation(parsed.data)
})
