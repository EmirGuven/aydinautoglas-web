import { testimonialInputSchema } from '#shared/schemas/testimonials'
import { createTestimonial } from '../../../services/testimonials.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const body = await readBody(event)
  const parsed = testimonialInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  setResponseStatus(event, 201)
  return createTestimonial(parsed.data)
})
