import { describe, expect, it } from 'vitest'
import { redirectInputSchema } from './redirects'

describe('redirectInputSchema', () => {
  it('accepts a valid redirect', () => {
    const result = redirectInputSchema.safeParse({ fromPath: '/old-page', toPath: '/new-page' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.statusCode).toBe(301)
  })

  it('rejects a fromPath without a leading slash', () => {
    const result = redirectInputSchema.safeParse({ fromPath: 'old-page', toPath: '/new-page' })
    expect(result.success).toBe(false)
  })

  it('rejects an unsupported status code', () => {
    const result = redirectInputSchema.safeParse({ fromPath: '/old-page', toPath: '/new-page', statusCode: 404 })
    expect(result.success).toBe(false)
  })
})
