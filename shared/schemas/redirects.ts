import { z } from 'zod'

export const redirectInputSchema = z.object({
  fromPath: z.string().min(1).startsWith('/', 'Must start with /'),
  toPath: z.string().min(1),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
})

export type RedirectInput = z.infer<typeof redirectInputSchema>
