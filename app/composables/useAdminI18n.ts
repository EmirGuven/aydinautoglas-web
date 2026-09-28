import de from '../i18n/admin/de.json'
import en from '../i18n/admin/en.json'
import tr from '../i18n/admin/tr.json'

/**
 * Standalone admin-panel i18n — deliberately NOT @nuxtjs/i18n. The public site's i18n module
 * ties `locale` to the URL (prefix_except_default routing, hreflang, etc. — Phase 7); the
 * admin panel's language is a per-user preference (`users.locale`) that must never affect
 * public routing or vice versa. Keeping this fully separate avoids any risk of the two
 * systems fighting over what "the current locale" means.
 */
const CATALOGS: Record<string, Record<string, unknown>> = { de, en, tr }
const DEFAULT_LOCALE = 'de'

function getNested(obj: Record<string, unknown>, dottedKey: string): string | undefined {
  let cursor: unknown = obj
  for (const part of dottedKey.split('.')) {
    if (typeof cursor !== 'object' || cursor === null) return undefined
    cursor = (cursor as Record<string, unknown>)[part]
  }
  return typeof cursor === 'string' ? cursor : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match))
}

export function useAdminI18n() {
  const { user } = useAuth()
  const adminLocale = computed(() => user.value?.locale ?? DEFAULT_LOCALE)

  function t(key: string, params?: Record<string, string | number>): string {
    const catalog = CATALOGS[adminLocale.value] ?? CATALOGS[DEFAULT_LOCALE]!
    const value = getNested(catalog, key) ?? getNested(CATALOGS[DEFAULT_LOCALE]!, key)
    if (value === undefined) return key
    return interpolate(value, params)
  }

  return { adminLocale, t }
}
