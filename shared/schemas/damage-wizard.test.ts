import { describe, expect, it } from 'vitest'
import { damageWizardOptionInputSchema, damageWizardRuleInputSchema } from './damage-wizard'

describe('damageWizardOptionInputSchema', () => {
  it('accepts a valid option', () => {
    const result = damageWizardOptionInputSchema.safeParse({
      questionId: '11111111-1111-4111-8111-111111111111',
      label: { de: 'Kleiner als eine Münze' },
      score: 10,
    })
    expect(result.success).toBe(true)
  })

  it('defaults score to 0', () => {
    const result = damageWizardOptionInputSchema.safeParse({
      questionId: '11111111-1111-4111-8111-111111111111',
      label: { de: 'Option' },
    })
    expect(result.success).toBe(true)
    expect(result.success && result.data.score).toBe(0)
  })
})

describe('damageWizardRuleInputSchema', () => {
  it('accepts a valid rule', () => {
    const result = damageWizardRuleInputSchema.safeParse({
      minScore: 50,
      recommendation: 'replace',
      message: { de: 'Austausch empfohlen' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid recommendation', () => {
    const result = damageWizardRuleInputSchema.safeParse({
      minScore: 50,
      recommendation: 'fix-it-yourself',
      message: {},
    })
    expect(result.success).toBe(false)
  })
})
