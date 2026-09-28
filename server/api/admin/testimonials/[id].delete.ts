import { deleteTestimonial } from '../../../services/testimonials.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing testimonial id' })
  await deleteTestimonial(id)
  return { success: true }
})
