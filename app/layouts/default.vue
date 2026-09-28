<script setup lang="ts">
const { data: organizationJsonLd } = await useFetch('/api/json-ld/organization', { key: 'organization-json-ld' })
useJsonLd(organizationJsonLd)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-text">
    <UiLanguageSuggestionBanner />
    <UiHeader />
    <main class="flex-1 pb-16 sm:pb-0">
      <slot />
    </main>
    <UiFooter />
    <UiMobileCtaBar />
    <UiCookieConsentBanner />
    <UiAnalyticsLoader />
  </div>
</template>
