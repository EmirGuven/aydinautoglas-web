/**
 * Shared per-request state: the current page's equivalent path in every locale it has a
 * translation for (e.g. { de: '/scheibenreparatur', en: '/services/windshield-repair' }).
 * A detail page with its own per-locale slug (CMS page, service, branch, blog post) sets
 * this; `LanguageSwitcher` reads it to send the visitor to the actual translated content
 * instead of the same slug re-interpreted in another language.
 */
export function useContentLocalePaths() {
  return useState<Record<string, string> | null>('content-locale-paths', () => null)
}

/** Call from a page's setup(); registers a watcher that keeps the shared state in sync and clears it on unmount. */
export function syncContentLocalePaths(paths: MaybeRefOrGetter<Record<string, string> | undefined>) {
  const state = useContentLocalePaths()
  watchEffect(() => {
    state.value = toValue(paths) ?? null
  })
  onScopeDispose(() => {
    state.value = null
  })
}
