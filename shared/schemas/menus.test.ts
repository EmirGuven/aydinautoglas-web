import { describe, expect, it } from 'vitest'
import { menuItemInputSchema, reorderMenuItemsSchema } from './menus'

describe('menuItemInputSchema', () => {
  it('accepts a valid menu item', () => {
    const result = menuItemInputSchema.safeParse({
      label: { de: 'Leistungen' },
      linkType: 'url',
      linkValue: '/leistungen',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty linkValue', () => {
    const result = menuItemInputSchema.safeParse({
      label: { de: 'Leistungen' },
      linkType: 'url',
      linkValue: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('reorderMenuItemsSchema', () => {
  it('accepts a list of reorder instructions', () => {
    const result = reorderMenuItemsSchema.safeParse([
      { id: '11111111-1111-4111-8111-111111111111', parentId: null, sortOrder: 0 },
      { id: '22222222-2222-4222-8222-222222222222', parentId: null, sortOrder: 1 },
    ])
    expect(result.success).toBe(true)
  })
})
