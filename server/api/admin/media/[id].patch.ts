import { updateMediaSchema } from '../../../../shared/schemas/media'
import { updateMediaAltText } from '../../../services/media.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing media id' })
  }

  const body = await readBody(event)
  const parsed = updateMediaSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  return updateMediaAltText(id, parsed.data.altText)
})
