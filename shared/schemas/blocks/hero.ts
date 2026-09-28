import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const heroBlockSchema = z.object({
  type: z.literal('hero'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    ctaLabel: translatableOptionalText(),
    ctaHref: z.string().optional(),
    backgroundMediaId: z.string().uuid().optional(),
    /** Short trust signals shown under the CTA, e.g. "Free loaner car", "300+ locations" (junited-autoglas.de-style). */
    badges: z.array(translatableOptionalText()).default([]),
  }),
})
