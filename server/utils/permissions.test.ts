import { describe, expect, it } from 'vitest'
import { ForbiddenError, requireRole } from './permissions'

describe('requireRole', () => {
  it('allows a role equal to the minimum', () => {
    expect(() => requireRole('admin', 'admin')).not.toThrow()
  })

  it('allows a role above the minimum', () => {
    expect(() => requireRole('owner', 'editor')).not.toThrow()
  })

  it('rejects a role below the minimum', () => {
    expect(() => requireRole('editor', 'admin')).toThrow(ForbiddenError)
  })
})
