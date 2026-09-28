import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** Content is pulled live from the `services` table; this block only configures how. */
export const serviceCardsBlockSchema = z.object({
  type: z.literal('service-cards'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    limit: z.number().int().min(1).max(24).default(6),
    onlyFeatured: z.boolean().default(false),
    /** `grid` = icon-card grid (default); `list` = full-width rows, better for a longer/scannable list. */
    variant: z.enum(['grid', 'list']).default('grid'),
  }),
})
