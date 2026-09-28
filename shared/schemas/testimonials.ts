import { z } from 'zod'
import { translatableText } from './i18n'

export const testimonialInputSchema = z.object({
  authorName: z.string().min(1),
  authorPhotoMediaId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  text: translatableText(),
})

export type TestimonialInput = z.infer<typeof testimonialInputSchema>
