import { jwtVerify, SignJWT } from 'jose'
import type { UserRole } from '../../shared/schemas/users'

const SESSION_COOKIE = 'admin_session'
const SESSION_DURATION_SECONDS = 8 * 60 * 60 // 8 hours

export interface SessionPayload {
  sub: string
  email: string
  role: UserRole
  locale: string
}

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecretKey())
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as UserRole,
    locale: payload.locale as string,
  }
}

export { SESSION_COOKIE, SESSION_DURATION_SECONDS }
