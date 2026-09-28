import { describe, expect, it } from 'vitest'
import { translationInputSchema } from './translations'

describe('translationInputSchema', () => {
  it('accepts a valid dot-separated key with per-language values', () => {
    const result = translationInputSchema.safeParse({
      key: 'contactForm.send',
      values: { de: 'Senden', en: 'Send' },
      group: 'contactForm',
    })
    expect(result.success).toBe(true)
  })

  it('defaults group to "general" when omitted', () => {
    const result = translationInputSchema.safeParse({ key: 'common.learnMore', values: { de: 'Mehr erfahren' } })
    expect(result.success).toBe(true)
    expect(result.success && result.data.group).toBe('general')
  })

  it('rejects a key with spaces or invalid characters', () => {
    const result = translationInputSchema.safeParse({ key: 'contact form.send', values: {} })
    expect(result.success).toBe(false)
  })
})
