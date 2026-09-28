import { z } from 'zod'

export const appointmentStatusSchema = z.enum(['new', 'contacted', 'scheduled', 'done', 'cancelled'])

export const appointmentSubmissionSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  licensePlate: z.string().optional(),
  serviceId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  insuranceCompany: z.string().optional(),
  insuranceNumber: z.string().optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  locale: z.string().min(2),
  consent: z.literal(true, { message: 'Consent is required' }),
  /**
   * Honeypot field: real users never fill this in (it's hidden), bots often do.
   * Deliberately NOT length-restricted here — a schema-level rejection would 400 and tip
   * bots off; the service layer instead accepts the request and silently no-ops it.
   */
  companyWebsite: z.string().optional(),
})

export const appointmentUpdateSchema = z.object({
  status: appointmentStatusSchema.optional(),
  adminNotes: z.string().optional(),
})

export type AppointmentSubmission = z.infer<typeof appointmentSubmissionSchema>
export type AppointmentUpdate = z.infer<typeof appointmentUpdateSchema>
