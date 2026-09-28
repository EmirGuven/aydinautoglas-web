/**
 * Sets <html lang>, rel=canonical and rel=alternate hreflang links for a public page.
 *
 * Pass an explicit `localizedPaths` map (locale code -> path) for content that has a
 * per-locale slug (CMS pages, services, branches, blog posts) — the section prefix in
 * these paths is fixed English (ADR-0006), only the slug segment differs per locale, and a
 * locale missing from the map is skipped (no broken hreflang for an untranslated item).
 * Omit it for fixed-path pages (list pages, the appointment form, ...): every active
 * locale's path is then derived from the current route via `switchLocalePath`.
 */
export function useLocaleSeo(localizedPaths?: MaybeRefOrGetter<Record<string, string> | undefined>) {
  const { locale, locales: i18nLocales, defaultLocale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const requestUrl = useRequestURL()

  useHead(() => {
    const explicit = toValue(localizedPaths)
    const activeCodes = i18nLocales.value.map((l) => (typeof l === 'string' ? l : l.code))
    const paths: Record<string, string>
      = explicit ?? Object.fromEntries(activeCodes.map((code) => [code, switchLocalePath(code) || '/']).filter(([, path]) => path))

    const toAbsolute = (path: string) => new URL(path, requestUrl.origin).toString()

    const links = Object.entries(paths).map(([code, path]) => ({
      rel: 'alternate',
      hreflang: code,
      href: toAbsolute(path),
      key: `alt-${code}`,
    }))

    const defaultPath = paths[defaultLocale] ?? Object.values(paths)[0]
    if (defaultPath) {
      links.push({ rel: 'alternate', hreflang: 'x-default', href: toAbsolute(defaultPath), key: 'alt-x-default' })
    }

    const canonicalPath = paths[locale.value] ?? requestUrl.pathname

    return {
      htmlAttrs: { lang: locale.value },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- unhead's Link union requires per-rel required props (e.g. hreflang) that don't apply to `canonical`; mixing rel kinds in one array defeats its discrimination.
      link: [...links, { rel: 'canonical', href: toAbsolute(canonicalPath), key: 'canonical' }] as any,
    }
  })
}
