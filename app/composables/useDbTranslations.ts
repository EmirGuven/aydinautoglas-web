/**
 * Fetches DB-stored UI-string overrides (`translations` table, admin "Translations" screen)
 * and merges them into vue-i18n's message catalog on top of the static `i18n/locales/*.json`
 * defaults — those files stay the fallback/default values (per prompt.md §14), the database
 * is the source of truth once a key is edited there. Mirrors `useTheme()`'s pattern: the
 * `useFetch` isn't explicitly awaited, but Nuxt's SSR data-fetching still resolves it before
 * finalizing the response, so the merge (a watchEffect keyed off the fetched data) has already
 * run by the time any `$t()` call in the tree is actually rendered.
 */
export function useDbTranslations() {
  const { data } = useFetch<Record<string, Record<string, string>>>('/api/translations', {
    key: 'db-translations',
  })
  const i18n = useI18n()

  watchEffect(() => {
    if (!data.value) return
    const byLocale: Record<string, Record<string, unknown>> = {}
    for (const [key, values] of Object.entries(data.value)) {
      for (const [locale, value] of Object.entries(values)) {
        if (!value) continue
        byLocale[locale] ??= {}
        setNestedKey(byLocale[locale]!, key, value)
      }
    }
    for (const [locale, messages] of Object.entries(byLocale)) {
      i18n.mergeLocaleMessage(locale, messages)
    }
  })
}

/** "contactForm.send" -> { contactForm: { send: value } }, matching vue-i18n's nested message shape. */
function setNestedKey(target: Record<string, unknown>, dottedKey: string, value: string) {
  const parts = dottedKey.split('.')
  let cursor = target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    cursor[part] ??= {}
    cursor = cursor[part] as Record<string, unknown>
  }
  cursor[parts.at(-1)!] = value
}
