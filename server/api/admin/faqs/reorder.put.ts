import { z } from 'zod'
import { reorderFaqs } from '../../../services/faqs.service'
import { requireSessionWithRole } from '../../../utils/session'

const bodySchema = z.array(z.string().uuid())

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  await reorderFaqs(parsed.data)
  return { success: true }
})
