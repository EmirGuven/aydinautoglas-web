import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** Content is pulled live from the `testimonials` table. */
export const testimonialsBlockSchema = z.object({
  type: z.literal('testimonials'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    limit: z.number().int().min(1).max(24).default(6),
    /** `grid` = static card grid (default); `scroll` = horizontal CSS scroll-snap row of larger cards. */
    variant: z.enum(['grid', 'scroll']).default('grid'),
  }),
})
