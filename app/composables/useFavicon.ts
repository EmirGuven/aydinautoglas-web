/** Resolves site_settings.logo.faviconMediaId to a <link rel="icon"> tag, falling back to none when unset. */
export function useFavicon() {
  const { data: settings } = usePublicSettings()

  const faviconMediaId = computed(() => settings.value?.logo?.faviconMediaId)
  const { data: faviconMedia } = useAsyncData(
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
