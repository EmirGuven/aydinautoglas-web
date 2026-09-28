import { z } from 'zod'
import { translatableRichText, translatableText } from '../i18n'

export const imageTextBlockSchema = z.object({
  type: z.literal('image-text'),
  data: z.object({
    heading: translatableText(),
    text: translatableRichText(),
    mediaId: z.string().uuid().optional(),
    imagePosition: z.enum(['left', 'right']).default('left'),
  }),
})
