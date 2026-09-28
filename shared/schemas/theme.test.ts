import { describe, expect, it } from 'vitest'
import { themeSchema } from './theme'

const validTheme = {
  colorPrimary: '#1d4ed8',
  colorSecondary: '#0f172a',
  colorAccent: '#f59e0b',
  colorBackground: '#ffffff',
  colorText: '#0f172a',
  colorSurface: '#ffffff',
  colorBorder: '#e2e8f0',
  colorMuted: '#64748b',
  fontFamily: 'system-ui, sans-serif',
  fontFamilyHeading: 'system-ui, sans-serif',
  borderRadius: '0.5rem',
  radiusCard: '0.5rem',
  shadowCard: '0 1px 2px rgba(15, 23, 42, 0.08)',
  shadowElevated: '0 12px 28px rgba(15, 23, 42, 0.18)',
  buttonStyle: 'solid',
}

describe('themeSchema', () => {
  it('accepts a valid theme', () => {
    const result = themeSchema.safeParse(validTheme)
    expect(result.success).toBe(true)
  })

  it('rejects a non-hex color', () => {
    const result = themeSchema.safeParse({ ...validTheme, colorPrimary: 'blue' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown button style', () => {
    const result = themeSchema.safeParse({ ...validTheme, buttonStyle: 'glowing' })
    expect(result.success).toBe(false)
  })
})
