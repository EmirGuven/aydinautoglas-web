import { z } from 'zod'
import { reorderBlocks } from '../../../../services/pages.service'
import { requireSessionWithRole } from '../../../../utils/session'

const bodySchema = z.array(z.string().uuid())

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const pageId = getRouterParam(event, 'id')
  if (!pageId) throw createError({ statusCode: 400, statusMessage: 'Missing page id' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  await reorderBlocks(pageId, parsed.data)
  return { success: true }
})
