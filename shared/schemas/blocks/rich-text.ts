import { z } from 'zod'
import { translatableRichText } from '../i18n'

export const richTextBlockSchema = z.object({
  type: z.literal('rich-text'),
  data: z.object({
    content: translatableRichText(),
  }),
})
