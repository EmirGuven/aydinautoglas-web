import type { UserRole } from '../schemas/users'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  locale: string
}
