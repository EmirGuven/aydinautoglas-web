import { z } from 'zod'
import { reorderServices } from '../../../services/services.service'
import { requireSessionWithRole } from '../../../utils/session'

const bodySchema = z.array(z.string().uuid())

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  await reorderServices(parsed.data)
  return { success: true }
})
