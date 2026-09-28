import { z } from 'zod'

export const contactMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
  locale: z.string().min(2),
  /**
   * Honeypot field: real users never fill this in (it's hidden), bots often do.
   * Deliberately NOT length-restricted here — a schema-level rejection would 400 and tip
   * bots off; the service layer instead accepts the request and silently no-ops it.
   */
  companyWebsite: z.string().optional(),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
