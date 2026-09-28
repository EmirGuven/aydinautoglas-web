import { z } from 'zod'

export const applySectorTemplateSchema = z.object({
  template: z.enum(['autoglass', 'generic-service']),
})

export type ApplySectorTemplateInput = z.infer<typeof applySectorTemplateSchema>
