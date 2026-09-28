import { describe, expect, it } from 'vitest'
import { serviceInputSchema } from './services'

describe('serviceInputSchema', () => {
  it('accepts a valid service', () => {
    const result = serviceInputSchema.safeParse({
      slug: { de: 'scheibenreparatur' },
      title: { de: 'Scheibenreparatur' },
      content: { de: '<p>Details</p>' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-kebab-case slug', () => {
    const result = serviceInputSchema.safeParse({
      slug: { de: 'Nicht Gültig' },
      title: { de: 'Scheibenreparatur' },
      content: {},
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing title', () => {
    const result = serviceInputSchema.safeParse({
      slug: { de: 'scheibenreparatur' },
      content: {},
    })
    expect(result.success).toBe(false)
  })
})
