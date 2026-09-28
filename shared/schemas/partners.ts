import { z } from 'zod'

export const partnerInputSchema = z.object({
  name: z.string().min(1),
  logoMediaId: z.string().uuid(),
  websiteUrl: z.string().url().optional(),
})

export type PartnerInput = z.infer<typeof partnerInputSchema>
