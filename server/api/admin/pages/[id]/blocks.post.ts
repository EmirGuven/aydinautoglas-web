import { blockSchema } from '../../../../../shared/schemas/blocks'
import { createBlock } from '../../../../services/pages.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const pageId = getRouterParam(event, 'id')
  if (!pageId) throw createError({ statusCode: 400, statusMessage: 'Missing page id' })

  const body = await readBody(event)
  const parsed = blockSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid block', data: parsed.error.flatten() })
  }

  setResponseStatus(event, 201)
  return createBlock(pageId, parsed.data)
})
