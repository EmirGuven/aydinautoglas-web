import { describe, expect, it } from 'vitest'
import { blogPostInputSchema } from './blog'

describe('blogPostInputSchema', () => {
  it('accepts a valid post', () => {
    const result = blogPostInputSchema.safeParse({
      slug: { de: 'winter-tipps' },
      title: { de: 'Winter Tipps' },
      content: { de: '<p>...</p>' },
      publishedByLocale: { de: true },
    })
    expect(result.success).toBe(true)
  })

  it('defaults publishedByLocale to an empty record', () => {
    const result = blogPostInputSchema.safeParse({
      slug: { de: 'winter-tipps' },
      title: { de: 'Winter Tipps' },
      content: {},
    })
    expect(result.success).toBe(true)
    expect(result.success && result.data.publishedByLocale).toEqual({})
  })
})
