import { describe, expect, it } from 'vitest'
import { translatableSlug, translatableText } from './i18n'

describe('translatableText', () => {
  it('accepts a record with at least one language', () => {
    const result = translatableText().safeParse({ de: 'Willkommen' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty record', () => {
    const result = translatableText().safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts a language code not hardcoded anywhere (new language support)', () => {
    const result = translatableText().safeParse({ pt: 'Bem-vindo' })
    expect(result.success).toBe(true)
  })
})

describe('translatableSlug', () => {
  it('accepts lowercase kebab-case slugs', () => {
    const result = translatableSlug().safeParse({ de: 'scheibenreparatur', en: 'windshield-repair' })
    expect(result.success).toBe(true)
  })

  it('rejects slugs with uppercase or spaces', () => {
    const result = translatableSlug().safeParse({ de: 'Nicht Gültig' })
    expect(result.success).toBe(false)
  })
})
