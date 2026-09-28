import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { languages } from '../db/schema'

/** Short-TTL cache: read on nearly every request (sitemap, redirects), changes rarely. */
let cachedDefault: { code: string; expiresAt: number } | null = null
const TTL_MS = 60_000

export async function getDefaultLocaleCode(): Promise<string> {
  if (cachedDefault && cachedDefault.expiresAt > Date.now()) return cachedDefault.code
  const [row] = await db.select({ code: languages.code }).from(languages).where(eq(languages.isDefault, true)).limit(1)
  const code = row?.code ?? 'de'
  cachedDefault = { code, expiresAt: Date.now() + TTL_MS }
  return code
}

/** prefix_except_default: the default locale has no prefix, every other locale is prefixed with its code. */
export function withLocalePrefix(path: string, code: string, defaultCode: string): string {
  if (code === defaultCode) return path
  return path === '/' ? `/${code}` : `/${code}${path}`
}

/**
 * Reverses withLocalePrefix: given a raw request path, figures out which locale it's for
 * and strips the prefix (if any). Used by non-i18n-aware server code (markdown export,
 * not-found logging context) that needs to resolve a path the same way the public router does.
 */
export async function resolveLocaleFromPath(path: string): Promise<{ locale: string; rest: string }> {
  const rows = await db.select({ code: languages.code }).from(languages).where(eq(languages.isActive, true))
  const defaultCode = await getDefaultLocaleCode()
  const segments = path.split('/')
  const maybeCode = segments[1]
  if (maybeCode && maybeCode !== defaultCode && rows.some((r) => r.code === maybeCode)) {
    return { locale: maybeCode, rest: `/${segments.slice(2).join('/')}` }
  }
  return { locale: defaultCode, rest: path }
}
