import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const certificateItemSchema = z.object({
  title: translatableText(),
  issuer: translatableOptionalText(),
  mediaId: z.string().uuid().optional(),
})

/** E-E-A-T trust signals: certifications, awards, memberships (prompt.md §15.4). */
export const certificatesBlockSchema = z.object({
  type: z.literal('certificates'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    items: z.array(certificateItemSchema).default([]),
  }),
})
