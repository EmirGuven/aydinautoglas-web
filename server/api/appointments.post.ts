import { appointmentSubmissionSchema } from '#shared/schemas/appointments'
import { createAppointment } from '../services/appointments.service'
import { sendTemplatedEmail } from '../services/email.service'
import { getSetting } from '../services/site-settings.service'
import { checkRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, 'appointment', 5, 60_000)

  const body = await readBody(event)
  const parsed = appointmentSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  if (parsed.data.companyWebsite) {
    return { success: true }
  }

  const created = await createAppointment(parsed.data)

  const contactSettings = await getSetting('contact')
  const vars = { name: parsed.data.contactName, email: parsed.data.contactEmail }
  if (contactSettings?.email) {
    await sendTemplatedEmail('appointmentAdminNotification', contactSettings.email, parsed.data.locale, vars)
  }
  await sendTemplatedEmail('appointmentCustomerConfirmation', parsed.data.contactEmail, parsed.data.locale, vars)

  return { success: true, id: created.id }
})
