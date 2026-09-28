import { describe, expect, it } from 'vitest'
import { keysActuallySent } from './partial-update'

describe('keysActuallySent', () => {
  it('drops a key Zod defaulted that was never in the raw body', () => {
    // Simulates schema.partial().safeParse({ slug: {...} }) against a schema where
    // `isFeatured` has `.default(false)` — Zod fills it in even though it was never sent.
    const parsed = { slug: { de: 'new-slug' }, isFeatured: false }
    const rawBody = { slug: { de: 'new-slug' } }
    expect(keysActuallySent(parsed, rawBody)).toEqual({ slug: { de: 'new-slug' } })
  })

  it('keeps a key that was explicitly sent, even if it matches the default', () => {
    const parsed = { isFeatured: false }
    const rawBody = { isFeatured: false }
    expect(keysActuallySent(parsed, rawBody)).toEqual({ isFeatured: false })
  })

  it('returns an empty object for a non-object raw body', () => {
    expect(keysActuallySent({ a: 1 }, null)).toEqual({})
    expect(keysActuallySent({ a: 1 }, undefined)).toEqual({})
  })
})
