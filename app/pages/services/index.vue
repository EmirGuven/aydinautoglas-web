<script setup lang="ts">
interface ServiceRow {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  shortDescription: Record<string, string>
}

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useFetch<ServiceRow[]>('/api/content/services', { query: { limit: 100 } })

useSeoMeta({ title: () => t('listPages.servicesTitle') })
useLocaleSeo()
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <h1 class="font-heading text-fluid-h1 font-bold text-text">{{ t('listPages.servicesTitle') }}</h1>
    <div v-if="rows?.length" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="service in rows"
        :key="service.id"
        :to="localePath(`/services/${service.slug[locale] ?? service.slug.de}`)"
        class="rounded-card border border-border bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-elevated"
      >
        <h2 class="font-heading font-semibold text-text">{{ pickTranslated(service.title, locale) }}</h2>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(service.shortDescription, locale) }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-8 text-muted">{{ t('listPages.servicesEmpty') }}</p>
  </main>
</template>
