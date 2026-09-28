import { getRedirectByFromPath } from '../services/redirects.service'

/**
 * 301/302s admin-configured legacy URLs before Nuxt's page router ever sees them.
 * Only applies to plain document navigations (GET, no _nuxt/api/admin prefix) — a
 * client-side <NuxtLink> transition never hits the Nitro server, so this only matters
 * for external links/bookmarks/crawlers, which is exactly where a 301 is needed.
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return
  const path = event.path.split('?')[0] ?? event.path
  if (path.startsWith('/api/') || path.startsWith('/_nuxt/') || path.startsWith('/uploads/')) return

  const redirect = await getRedirectByFromPath(path)
  if (redirect) {
    await sendRedirect(event, redirect.toPath, redirect.statusCode as 301 | 302)
  }
})
