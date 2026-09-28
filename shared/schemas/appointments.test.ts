import { describe, expect, it } from 'vitest'
import { appointmentSubmissionSchema } from './appointments'

const validSubmission = {
  contactName: 'Max Mustermann',
  contactEmail: 'max@example.com',
  locale: 'de',
  consent: true as const,
}

describe('appointmentSubmissionSchema', () => {
  it('accepts a minimal valid submission', () => {
    const result = appointmentSubmissionSchema.safeParse(validSubmission)
    expect(result.success).toBe(true)
  })

  it('rejects a submission without consent', () => {
    const result = appointmentSubmissionSchema.safeParse({ ...validSubmission, consent: false })
    expect(result.success).toBe(false)
  })

  it('accepts a submission with the honeypot field filled in at the schema level', () => {
    // The schema stays permissive here on purpose so a filled honeypot can be silently
    // no-op'd by the API handler (server/api/appointments.post.ts) instead of a 400 that
    // would tip a bot off. See the field's own doc comment.
    const result = appointmentSubmissionSchema.safeParse({ ...validSubmission, companyWebsite: 'http://spam.example' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = appointmentSubmissionSchema.safeParse({ ...validSubmission, contactEmail: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})
