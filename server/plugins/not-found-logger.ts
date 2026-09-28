import { recordNotFoundHit } from '../services/not-found-logs.service'

/**
 * Logs every public-facing 404 (path + hit count) so an admin can see which broken/missing
 * URLs visitors and crawlers are actually requesting and turn the high-traffic ones into a
 * redirect with one click (prompt.md §15.1, Admin → Redirects → 404 log).
 */
export default defineNitroPlugin((nitroApp) => {
  // Nuxt's page-level 404s are thrown as a `fatal: true` h3 error (see app/pages/[[...slug]].vue,
  // app/pages/services/[slug].vue, app/pages/blog/[slug].vue) and short-circuit straight to h3's
  // error handling — they never reach the 'render:response' hook, only 'error'.
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode !== 404 || !event) return
    if (event.method !== 'GET') return

    const path = event.path.split('?')[0] ?? event.path
    if (path.startsWith('/api/') || path.startsWith('/admin') || path.startsWith('/_nuxt/') || path.startsWith('/uploads/')) return

    try {
      await recordNotFoundHit(path)
    } catch {
      // Never let logging failure affect the actual 404 response.
    }
  })
})
