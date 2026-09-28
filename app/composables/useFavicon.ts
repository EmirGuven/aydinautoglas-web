/**
 * Resolves site_settings.logo.faviconMediaId to a <link rel="icon"> tag, falling back to
 * none when unset. Must `await` usePublicSettings() before computing faviconMediaId — Nuxt
 * only reliably tracks a dependent useAsyncData's *initial* fetch for SSR; a value that only
 * becomes correct after its `watch` option re-fires (i.e. reading it before settings has
 * resolved) races the response and can lose, exactly like app/components/ui/Header.vue's
 * logo lookup does it correctly by awaiting settings first.
 */
export async function useFavicon() {
  const { data: settings } = await usePublicSettings()

  const faviconMediaId = computed(() => settings.value?.logo?.faviconMediaId)
  const { data: faviconMedia } = await useAsyncData(
    'favicon-media',
    (): Promise<Awaited<ReturnType<typeof fetchMediaMap>>> =>
      faviconMediaId.value ? fetchMediaMap([faviconMediaId.value]) : Promise.resolve({}),
    { watch: [faviconMediaId] },
  )

  const faviconUrl = computed(() => mediaUrl(faviconMedia.value?.[faviconMediaId.value ?? ''], 'thumb'))
  const faviconLinks = computed(() => (faviconUrl.value ? [{ rel: 'icon' as const, href: faviconUrl.value }] : []))

  useHead({
    link: faviconLinks,
  })
}
