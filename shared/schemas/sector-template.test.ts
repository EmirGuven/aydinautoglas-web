import { describe, expect, it } from 'vitest'
import { applySectorTemplateSchema } from './sector-template'

describe('applySectorTemplateSchema', () => {
  it('accepts a known template key', () => {
    expect(applySectorTemplateSchema.safeParse({ template: 'autoglass' }).success).toBe(true)
    expect(applySectorTemplateSchema.safeParse({ template: 'generic-service' }).success).toBe(true)
  })

  it('rejects an unknown template key', () => {
    expect(applySectorTemplateSchema.safeParse({ template: 'dental-clinic' }).success).toBe(false)
  })
})
