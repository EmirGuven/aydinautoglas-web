<script setup lang="ts">
interface LocationRow {
  id: string
  slug: Record<string, string>
  name: Record<string, string>
  address: Record<string, string>
  phone?: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useFetch<LocationRow[]>('/api/content/locations')

useSeoMeta({ title: () => 'Branches' })
useLocaleSeo()
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">Branches</h1>
    <div v-if="rows?.length" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <NuxtLink
        v-for="location in rows"
        :key="location.id"
        :to="localePath(`/branches/${location.slug[locale] ?? location.slug.de}`)"
        class="rounded-button border border-slate-200 p-6 hover:border-primary"
      >
        <h2 class="font-semibold text-text">{{ pickTranslated(location.name, locale) }}</h2>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(location.address, locale) }}</p>
        <p v-if="location.phone" class="mt-2 text-sm text-text/70">{{ location.phone }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-8 text-text/50">No branches published yet.</p>
  </main>
</template>
