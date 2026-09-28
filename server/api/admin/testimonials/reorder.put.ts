import { z } from 'zod'
import { reorderTestimonials } from '../../../services/testimonials.service'
import { requireSessionWithRole } from '../../../utils/session'

const bodySchema = z.array(z.string().uuid())

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  await reorderTestimonials(parsed.data)
  return { success: true }
})
