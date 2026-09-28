import { SESSION_COOKIE } from '../../../utils/jwt'

export default defineEventHandler((event) => {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
  return { success: true }
})
