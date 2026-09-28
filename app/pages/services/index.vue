<script setup lang="ts">
interface ServiceRow {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  shortDescription: Record<string, string>
}

const { locale } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useFetch<ServiceRow[]>('/api/content/services', { query: { limit: 100 } })

useSeoMeta({ title: () => 'Services' })
useLocaleSeo()
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">Services</h1>
    <div v-if="rows?.length" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="service in rows"
        :key="service.id"
        :to="localePath(`/services/${service.slug[locale] ?? service.slug.de}`)"
        class="rounded-button border border-slate-200 p-6 hover:border-primary"
      >
        <h2 class="font-semibold text-text">{{ pickTranslated(service.title, locale) }}</h2>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(service.shortDescription, locale) }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-8 text-text/50">No services published yet.</p>
  </main>
</template>
