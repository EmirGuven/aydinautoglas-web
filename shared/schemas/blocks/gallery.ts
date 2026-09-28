import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const galleryBlockSchema = z.object({
  type: z.literal('gallery'),
  data: z.object({
    heading: translatableText().optional(),
    subheading: translatableOptionalText(),
    mediaIds: z.array(z.string().uuid()).default([]),
  }),
})
