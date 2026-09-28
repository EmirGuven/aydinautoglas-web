import { z } from 'zod'
import { languageCodeSchema } from './i18n'

export const languageSchema = z.object({
  code: languageCodeSchema,
  name: z.string().min(1),
  nativeName: z.string().min(1),
  flagEmoji: z.string().min(1).max(8),
  direction: z.enum(['ltr', 'rtl']).default('ltr'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type Language = z.infer<typeof languageSchema>
