import { describe, expect, it } from 'vitest'
import { blockSchema, defaultBlockData, BLOCK_TYPES } from './index'

describe('blockSchema', () => {
  it('accepts a valid hero block', () => {
    const result = blockSchema.safeParse({
      type: 'hero',
      data: { heading: { de: 'Willkommen' }, subheading: {}, ctaLabel: {} },
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid rich-text block', () => {
    const result = blockSchema.safeParse({
      type: 'rich-text',
      data: { content: { de: '<p>Hallo</p>' } },
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown block type', () => {
    const result = blockSchema.safeParse({ type: 'not-a-real-block', data: {} })
    expect(result.success).toBe(false)
  })

  it('rejects a hero block missing the required heading', () => {
    const result = blockSchema.safeParse({ type: 'hero', data: {} })
    expect(result.success).toBe(false)
  })

  it('provides valid default data for every registered block type', () => {
    for (const { type } of BLOCK_TYPES) {
      const result = blockSchema.safeParse({ type, data: defaultBlockData(type) })
      expect(result.success, `default data for "${type}" should be valid`).toBe(true)
    }
  })
})
