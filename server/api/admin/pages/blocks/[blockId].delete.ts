import { deleteBlock } from '../../../../services/pages.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const blockId = getRouterParam(event, 'blockId')
  if (!blockId) throw createError({ statusCode: 400, statusMessage: 'Missing block id' })

  await deleteBlock(blockId)
  return { success: true }
})
