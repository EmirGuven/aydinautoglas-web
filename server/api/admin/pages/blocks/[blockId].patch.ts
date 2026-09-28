import { z } from 'zod'
import { blockSchema } from '../../../../../shared/schemas/blocks'
import { getBlockById, updateBlock } from '../../../../services/pages.service'
import { requireSessionWithRole } from '../../../../utils/session'

const bodySchema = z.object({
  data: z.record(z.string(), z.unknown()),
  isVisible: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const blockId = getRouterParam(event, 'blockId')
  if (!blockId) throw createError({ statusCode: 400, statusMessage: 'Missing block id' })

  const body = await readBody(event)
  const parsedBody = bodySchema.safeParse(body)
  if (!parsedBody.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsedBody.error.flatten() })
  }

  const existing = await getBlockById(blockId)
  const parsedBlock = blockSchema.safeParse({ type: existing.type, data: parsedBody.data.data })
  if (!parsedBlock.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid block data', data: parsedBlock.error.flatten() })
  }

  return updateBlock(blockId, parsedBlock.data.type, parsedBlock.data.data, parsedBody.data.isVisible)
})
