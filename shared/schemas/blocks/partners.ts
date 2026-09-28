import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** Content is pulled live from the `partners` table. */
export const partnersBlockSchema = z.object({
  type: z.literal('partners'),
  data: z.object({
    heading: translatableText().optional(),
    subheading: translatableOptionalText(),
  }),
})
