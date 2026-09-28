/**
 * Resolves site_settings.logo.faviconMediaId to a <link rel="icon"> tag, falling back to
 * none when unset. Deliberately a single self-contained useAsyncData call (settings + media
 * lookup fetched imperatively with $fetch inside one handler), not `usePublicSettings()` plus
 * a second `useAsyncData` gated behind a reactive `watch` — that two-step chain raced Nuxt's
 * SSR response (the dependent fetch's *initial* run saw settings as still unresolved, and the
 * later `watch`-triggered refetch isn't reliably awaited before the HTML is sent). Not `async`
 * either: an async composable with awaits before further composable calls loses Nuxt's
 * instance context (NUXT_E1001) the moment its caller `await`s it in `<script setup>`.
 */
export function useFavicon() {
  const { data: faviconUrl } = useAsyncData('favicon-link', async () => {
    const settings = await $fetch<{ logo: { faviconMediaId?: string } | null }>('/api/settings/public')
    const faviconMediaId = settings.logo?.faviconMediaId
    if (!faviconMediaId) return null
    const media = await fetchMediaMap([faviconMediaId])
    return mediaUrl(media[faviconMediaId], 'thumb') || null
  })

  useHead({
    link: computed(() => (faviconUrl.value ? [{ rel: 'icon' as const, href: faviconUrl.value }] : [])),
  })
}
