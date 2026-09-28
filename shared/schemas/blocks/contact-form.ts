import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** Configurable form fields arrive in Phase 6; for now the form has a fixed name/email/phone/message shape. */
export const contactFormBlockSchema = z.object({
  type: z.literal('contact-form'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
  }),
})
