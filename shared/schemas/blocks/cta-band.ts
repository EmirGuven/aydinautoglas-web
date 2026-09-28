import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const ctaBandBlockSchema = z.object({
  type: z.literal('cta-band'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    ctaLabel: translatableText(),
    ctaHref: z.string().min(1),
  }),
})
