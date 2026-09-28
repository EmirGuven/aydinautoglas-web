import type { H3Event } from 'h3'
import type { UserRole } from '../../shared/schemas/users'
import { ForbiddenError, requireRole } from './permissions'
import type { SessionPayload } from './jwt'

/** admin-auth middleware guarantees this is set for any /api/admin/** route reaching a handler. */
export function requireSession(event: H3Event): SessionPayload {
  const session = event.context.user
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

/** requireSession + role check, mapped to a 403 h3 error instead of throwing ForbiddenError. */
export function requireSessionWithRole(event: H3Event, minimum: UserRole): SessionPayload {
  const session = requireSession(event)
  try {
    requireRole(session.role, minimum)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    throw error
  }
  return session
}
