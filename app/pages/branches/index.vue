<script setup lang="ts">
interface LocationRow {
  id: string
  slug: Record<string, string>
  name: Record<string, string>
  address: Record<string, string>
  phone?: string
}

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useFetch<LocationRow[]>('/api/content/locations')

useSeoMeta({ title: () => t('listPages.branchesTitle') })
useLocaleSeo()
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <h1 class="font-heading text-fluid-h1 font-bold text-text">{{ t('listPages.branchesTitle') }}</h1>
    <div v-if="rows?.length" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <NuxtLink
        v-for="location in rows"
        :key="location.id"
        :to="localePath(`/branches/${location.slug[locale] ?? location.slug.de}`)"
        class="rounded-card border border-border bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-elevated"
      >
        <h2 class="font-heading font-semibold text-text">{{ pickTranslated(location.name, locale) }}</h2>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(location.address, locale) }}</p>
        <p v-if="location.phone" class="mt-2 text-sm text-text/70">{{ location.phone }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-8 text-muted">{{ t('listPages.branchesEmpty') }}</p>
  </main>
</template>
