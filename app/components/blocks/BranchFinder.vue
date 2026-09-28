<script setup lang="ts">
import type { z } from 'zod'
import { MapPin, Phone } from '@lucide/vue'
import type { branchFinderBlockSchema } from '#shared/schemas/blocks'

interface LocationRow {
  id: string
  slug: Record<string, string>
  name: Record<string, string>
  address: Record<string, string>
  phone: string | null
  openingHours: Record<string, string>
}

const { data } = defineProps<{ data: z.infer<typeof branchFinderBlockSchema>['data'] }>()
const { locale, t } = useI18n()

const { data: rows } = await useFetch<LocationRow[]>('/api/content/locations')
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>
    <div v-if="rows?.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <NuxtLink
        v-for="location in rows"
        :key="location.id"
        :to="`/branches/${location.slug[locale] ?? location.slug.de}`"
        class="group rounded-button border border-slate-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex items-center gap-2 font-semibold text-text group-hover:text-primary">
          <MapPin class="h-5 w-5 shrink-0 text-primary" />
          {{ pickTranslated(location.name, locale) }}
        </div>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(location.address, locale) }}</p>
        <p v-if="location.phone" class="mt-2 flex items-center gap-2 text-sm text-text/70">
          <Phone class="h-4 w-4 shrink-0" /> {{ location.phone }}
        </p>
      </NuxtLink>
    </div>
    <p v-else class="mt-10 text-center text-text/50">{{ t('blocks.noBranchesYet') }}</p>
  </section>
</template>
