import { loginSchema } from '../../../../shared/schemas/users'
import { InvalidCredentialsError, login } from '../../../services/auth.service'
import { SESSION_COOKIE, SESSION_DURATION_SECONDS, signSessionToken } from '../../../utils/jwt'
import { checkRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, 'login', 10, 60_000)

  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    const user = await login(parsed.data)

    const token = await signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      locale: user.locale,
    })

    setCookie(event, SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      locale: user.locale,
    }
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
    }
    throw error
  }
})
