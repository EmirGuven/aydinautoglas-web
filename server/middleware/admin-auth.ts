import { SESSION_COOKIE, verifySessionToken } from '../utils/jwt'

const PUBLIC_ADMIN_ROUTES = new Set(['/api/admin/auth/login'])

/**
 * Protects /api/admin/** with a JWT cookie check. On success, attaches the
 * verified session to event.context.user for services/routes to read.
 * Role checks happen in the service layer (server/utils/permissions.ts).
 */
export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0] ?? event.path
  if (!path.startsWith('/api/admin/') || PUBLIC_ADMIN_ROUTES.has(path)) {
    return
  }

  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    event.context.user = await verifySessionToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
