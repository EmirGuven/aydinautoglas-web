import { testimonialInputSchema } from '#shared/schemas/testimonials'
import { updateTestimonial } from '../../../services/testimonials.service'
import { requireSessionWithRole } from '../../../utils/session'
import { keysActuallySent } from '../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing testimonial id' })
  const body = await readBody(event)
  const parsed = testimonialInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateTestimonial(id, keysActuallySent(parsed.data, body))
})
