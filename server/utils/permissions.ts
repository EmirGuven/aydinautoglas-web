import type { UserRole } from '../../shared/schemas/users'

const ROLE_RANK: Record<UserRole, number> = {
  editor: 0,
  admin: 1,
  owner: 2,
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
  }
}

/** Throws ForbiddenError unless `role` is at least as privileged as `minimum`. */
export function requireRole(role: UserRole, minimum: UserRole): void {
  if (ROLE_RANK[role] < ROLE_RANK[minimum]) {
    throw new ForbiddenError(`Requires role "${minimum}" or higher`)
  }
}
