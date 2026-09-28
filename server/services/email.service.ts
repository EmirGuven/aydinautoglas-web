import nodemailer from 'nodemailer'
import { getSetting } from './site-settings.service'
import { pickTranslatedServer } from '../utils/i18n'

export type EmailTemplateKey =
  | 'appointmentAdminNotification'
  | 'appointmentCustomerConfirmation'
  | 'contactAdminNotification'
  | 'contactCustomerConfirmation'

const DEFAULT_TEMPLATES: Record<EmailTemplateKey, { subject: Record<string, string>; body: Record<string, string> }> = {
  appointmentAdminNotification: {
    subject: { de: 'Neue Terminanfrage', en: 'New appointment request', tr: 'Yeni randevu talebi' },
    body: {
      de: 'Neue Terminanfrage von {{name}} ({{email}}).',
      en: 'New appointment request from {{name}} ({{email}}).',
      tr: '{{name}} ({{email}}) adlı kişiden yeni bir randevu talebi geldi.',
    },
  },
  appointmentCustomerConfirmation: {
    subject: { de: 'Ihre Terminanfrage', en: 'Your appointment request', tr: 'Randevu talebiniz' },
    body: {
      de: 'Hallo {{name}}, wir haben Ihre Terminanfrage erhalten und melden uns in Kürze.',
      en: 'Hi {{name}}, we have received your appointment request and will get back to you shortly.',
      tr: 'Merhaba {{name}}, randevu talebiniz alınmıştır, en kısa sürede sizinle iletişime geçeceğiz.',
    },
  },
  contactAdminNotification: {
    subject: { de: 'Neue Kontaktanfrage', en: 'New contact message', tr: 'Yeni iletişim mesajı' },
    body: {
      de: 'Neue Nachricht von {{name}} ({{email}}): {{message}}',
      en: 'New message from {{name}} ({{email}}): {{message}}',
      tr: '{{name}} ({{email}}) adlı kişiden yeni mesaj: {{message}}',
    },
  },
  contactCustomerConfirmation: {
    subject: { de: 'Ihre Nachricht', en: 'Your message', tr: 'Mesajınız' },
    body: {
      de: 'Hallo {{name}}, vielen Dank für Ihre Nachricht. Wir melden uns in Kürze.',
      en: 'Hi {{name}}, thank you for your message. We will get back to you shortly.',
      tr: 'Merhaba {{name}}, mesajınız için teşekkür ederiz. En kısa sürede size dönüş yapacağız.',
    },
  },
}

function renderTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

async function getTransporter() {
  const smtp = await getSetting('smtp')
  if (!smtp?.host) return null
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port ?? 587,
    secure: smtp.port === 465,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  })
}

/** Sends one templated email. Silently no-ops (with a console warning) if SMTP isn't configured yet. */
export async function sendTemplatedEmail(
  templateKey: EmailTemplateKey,
  to: string,
  locale: string,
  vars: Record<string, string>,
) {
  const transporter = await getTransporter()
  if (!transporter) {
    console.warn(`[email] SMTP not configured, skipping "${templateKey}" email to ${to}`)
    return
  }

  const templates = await getSetting('emailTemplates')
  const template = templates?.[templateKey] ?? DEFAULT_TEMPLATES[templateKey]
  const defaultTemplate = DEFAULT_TEMPLATES[templateKey]

  const subjectRaw = pickTranslatedServer(template.subject, locale) || pickTranslatedServer(defaultTemplate.subject, locale)
  const bodyRaw = pickTranslatedServer(template.body, locale) || pickTranslatedServer(defaultTemplate.body, locale)

  const smtp = await getSetting('smtp')
  await transporter.sendMail({
    from: smtp?.from || smtp?.user,
    to,
    subject: renderTemplate(subjectRaw, vars),
    text: renderTemplate(bodyRaw, vars),
  })
}
