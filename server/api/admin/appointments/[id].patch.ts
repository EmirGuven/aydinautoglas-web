import { appointmentUpdateSchema } from '#shared/schemas/appointments'
import { updateAppointment } from '../../../services/appointments.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing appointment id' })

  const body = await readBody(event)
  const parsed = appointmentUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return updateAppointment(id, parsed.data)
})
