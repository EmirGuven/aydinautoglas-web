<script setup lang="ts">
useTheme()
useFavicon()
useDbTranslations()

const { locale } = useI18n()
useHead({ htmlAttrs: { lang: () => locale.value } })
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
