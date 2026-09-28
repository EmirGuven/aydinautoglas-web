import { getUserById } from '../../../services/auth.service'

export default defineEventHandler(async (event) => {
  const session = event.context.user
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await getUserById(session.sub)
  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    locale: user.locale,
  }
})
