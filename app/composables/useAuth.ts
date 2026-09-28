import type { AuthUser } from '#shared/types/auth'

export function useAuth() {
  const user = useState<AuthUser | null>('admin-auth-user', () => null)

  async function fetchCurrentUser(): Promise<AuthUser | null> {
    try {
      // useRequestFetch forwards the incoming request's cookies during SSR;
      // plain $fetch would not, causing a logged-in user to bounce to /admin/login
      // on a full page load (as opposed to client-side navigation).
      if (import.meta.server) {
        const requestFetch = useRequestFetch() as unknown as (url: string) => Promise<AuthUser>
        user.value = await requestFetch('/api/admin/auth/me')
      } else {
        user.value = await $fetch<AuthUser>('/api/admin/auth/me')
      }
    } catch {
      user.value = null
    }
    return user.value
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    const loggedInUser = await $fetch<AuthUser>('/api/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = loggedInUser
    return loggedInUser
  }

  async function logout(): Promise<void> {
    await $fetch('/api/admin/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, fetchCurrentUser, login, logout }
}
