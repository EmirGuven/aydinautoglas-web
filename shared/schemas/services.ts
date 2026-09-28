import { z } from 'zod'
import { translatableOptionalText, translatableRichText, translatableSlug, translatableText } from './i18n'
import { localizedSeoSchema } from './seo'

export const serviceInputSchema = z.object({
  slug: translatableSlug(),
  title: translatableText(),
  shortDescription: translatableOptionalText(),
  content: translatableRichText(),
  iconOrMediaId: z.string().uuid().optional(),
  isFeatured: z.boolean().default(false),
  shortAnswer: translatableOptionalText(),
  priceFromCents: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(0).optional(),
  warranty: translatableOptionalText(),
  insuranceInfo: translatableOptionalText(),
  seo: localizedSeoSchema.default({}),
})

export type ServiceInput = z.infer<typeof serviceInputSchema>
