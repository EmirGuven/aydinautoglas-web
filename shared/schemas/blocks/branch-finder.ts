import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/**
 * Content is pulled live from the `locations` table. The interactive map
 * (loaded only after cookie consent, per prompt.md §8) arrives in Phase 7;
 * for now this renders a static list.
 */
export const branchFinderBlockSchema = z.object({
  type: z.literal('branch-finder'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
  }),
})
