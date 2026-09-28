import { z } from 'zod'

export const translationInputSchema = z.object({
  key: z.string().min(1).regex(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/, 'Key must be dot-separated (e.g. "contactForm.send")'),
  values: z.record(z.string(), z.string()),
  group: z.string().min(1).default('general'),
})

export type TranslationInput = z.infer<typeof translationInputSchema>
