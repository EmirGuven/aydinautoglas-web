import { createUserSchema } from '../../../../shared/schemas/users'
import { createUser } from '../../../services/users.service'
import { requireSession } from '../../../utils/session'
import { ForbiddenError } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const body = await readBody(event)
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    setResponseStatus(event, 201)
    return await createUser(session.sub, session.role, parsed.data)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw createError({ statusCode: 403, statusMessage: error.message })
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }
    throw error
  }
})
