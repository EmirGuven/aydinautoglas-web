import { getSetting } from '../services/site-settings.service'

/**
 * IndexNow's domain-verification convention: the key file must be served at
 * `https://<host>/<key>.txt` containing exactly the key.
 *
 * This is a middleware, not a `[key].txt.get.ts` file-based route, because of a real Nitro/
 * rou3 bug (confirmed by testing): a route file that mixes a bracket param with a literal
 * suffix in the same path segment (`[key].txt.get.ts` → intended to match `/:key.txt`) does
 * not get parsed into a `:key` param + static ".txt" suffix — instead it silently matches
 * (and swallows) every single-segment path, including `/`, breaking the entire public site.
 * A plain middleware that inspects `event.path` by hand avoids that route-registration path
 * entirely. See docs/decisions.md ADR-0017 for the full writeup.
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return

  const path = event.path.split('?')[0] ?? event.path
  const match = path.match(/^\/([^/]+)\.txt$/)
  if (!match?.[1]) return

  const settings = await getSetting('indexNow')
  if (!settings?.enabled || !settings.key || match[1] !== settings.key) return

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return settings.key
})
