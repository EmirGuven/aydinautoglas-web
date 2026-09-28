import { deleteUser } from '../../../services/users.service'
import { requireSession } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const targetUserId = getRouterParam(event, 'id')
  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
  }

  try {
    await deleteUser(session.sub, session.role, targetUserId)
    return { success: true }
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    throw error
  }
})
