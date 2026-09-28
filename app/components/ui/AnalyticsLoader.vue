<script setup lang="ts">
/** Loads Google Analytics only once the visitor has consented to the "analytics" category (DSGVO — prompt.md §9). */
const { data: settings } = await usePublicSettings()
const { hasConsent } = useCookieConsent()

const shouldLoad = computed(() => !!settings.value?.analytics?.googleAnalyticsId && hasConsent('analytics'))

useHead(() => {
  if (!shouldLoad.value) return {}
  const id = settings.value!.analytics!.googleAnalyticsId!
  return {
    script: [
      { key: 'ga-loader', src: `https://www.googletagmanager.com/gtag/js?id=${id}`, async: true },
      {
        key: 'ga-init',
        innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`,
      },
    ],
  }
})
</script>

<template>
  <div />
</template>
