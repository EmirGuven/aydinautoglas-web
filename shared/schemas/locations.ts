import { z } from 'zod'
import { translatableSlug, translatableText } from './i18n'

export const locationInputSchema = z.object({
  slug: translatableSlug(),
  name: translatableText(),
  address: translatableText(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openingHours: z.record(z.string(), z.string()).default({}),
})

export type LocationInput = z.infer<typeof locationInputSchema>
