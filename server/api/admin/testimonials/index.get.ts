import { listTestimonials } from '../../../services/testimonials.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listTestimonials()
})
