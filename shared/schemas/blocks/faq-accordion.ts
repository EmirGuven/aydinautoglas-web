import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** Content is pulled live from the `faqs` table. */
export const faqAccordionBlockSchema = z.object({
  type: z.literal('faq-accordion'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    categoryId: z.string().uuid().optional(),
  }),
})
