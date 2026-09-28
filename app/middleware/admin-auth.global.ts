export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  const { user, fetchCurrentUser } = useAuth()
  if (!user.value) {
    await fetchCurrentUser()
  }

  if (!user.value) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
