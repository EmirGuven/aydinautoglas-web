import { beforeAll, describe, expect, it } from 'vitest'

beforeAll(() => {
  process.env.ADMIN_JWT_SECRET = 'test-secret-at-least-32-characters-long'
})

describe('session token', () => {
  it('round-trips a signed payload', async () => {
    const { signSessionToken, verifySessionToken } = await import('./jwt')
    const payload = { sub: 'user-1', email: 'a@b.com', role: 'admin' as const, locale: 'de' }
    const token = await signSessionToken(payload)
    const verified = await verifySessionToken(token)
    expect(verified).toEqual(payload)
  })

  it('rejects a tampered token', async () => {
    const { signSessionToken, verifySessionToken } = await import('./jwt')
    const token = await signSessionToken({ sub: 'user-1', email: 'a@b.com', role: 'admin', locale: 'de' })
    await expect(verifySessionToken(`${token}tampered`)).rejects.toThrow()
  })
})
