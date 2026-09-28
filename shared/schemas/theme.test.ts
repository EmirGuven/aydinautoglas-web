import { describe, expect, it } from 'vitest'
import { themeSchema } from './theme'

describe('themeSchema', () => {
  it('accepts a valid theme', () => {
    const result = themeSchema.safeParse({
      colorPrimary: '#1d4ed8',
      colorSecondary: '#0f172a',
      colorAccent: '#f59e0b',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '0.5rem',
      buttonStyle: 'solid',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-hex color', () => {
    const result = themeSchema.safeParse({
      colorPrimary: 'blue',
      colorSecondary: '#0f172a',
      colorAccent: '#f59e0b',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      fontFamily: 'system-ui',
      borderRadius: '0.5rem',
      buttonStyle: 'solid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown button style', () => {
    const result = themeSchema.safeParse({
      colorPrimary: '#1d4ed8',
      colorSecondary: '#0f172a',
      colorAccent: '#f59e0b',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      fontFamily: 'system-ui',
      borderRadius: '0.5rem',
      buttonStyle: 'glowing',
    })
    expect(result.success).toBe(false)
  })
})
