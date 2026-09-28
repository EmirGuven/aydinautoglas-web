import { updateUserSchema } from '../../../../shared/schemas/users'
import { updateUser } from '../../../services/users.service'
import { requireSession } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const targetUserId = getRouterParam(event, 'id')
  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
  }

  const body = await readBody(event)
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    return await updateUser(session.sub, session.role, targetUserId, parsed.data)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    throw error
  }
})
