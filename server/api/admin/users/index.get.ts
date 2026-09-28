import { listUsers } from '../../../services/users.service'
import { requireSession } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  try {
    return await listUsers(session.role)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    throw error
  }
})
