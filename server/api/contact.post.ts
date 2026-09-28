import { contactMessageSchema } from '#shared/schemas/contact'
import { submitContactMessage } from '../services/contact.service'
import { sendTemplatedEmail } from '../services/email.service'
import { getSetting } from '../services/site-settings.service'
import { checkRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, 'contact', 5, 60_000)

  const body = await readBody(event)
  const parsed = contactMessageSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  if (parsed.data.companyWebsite) {
    // Honeypot tripped: pretend success so the bot doesn't learn anything, but don't store or notify.
    return { success: true }
  }

  await submitContactMessage(parsed.data)

  const contactSettings = await getSetting('contact')
  const vars = { name: parsed.data.name, email: parsed.data.email, message: parsed.data.message }
  if (contactSettings?.email) {
    await sendTemplatedEmail('contactAdminNotification', contactSettings.email, parsed.data.locale, vars)
  }
  await sendTemplatedEmail('contactCustomerConfirmation', parsed.data.email, parsed.data.locale, vars)

  return { success: true }
})
