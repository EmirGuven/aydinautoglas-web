<script setup lang="ts">
import type { z } from 'zod'
import { Wrench } from '@lucide/vue'
import type { serviceCardsBlockSchema } from '#shared/schemas/blocks'

interface ServiceRow {
  id: string
  title: Record<string, string>
  shortDescription: Record<string, string>
  slug: Record<string, string>
  iconOrMediaId?: string
}

const { data } = defineProps<{ data: z.infer<typeof serviceCardsBlockSchema>['data'] }>()
const { locale, t } = useI18n()

const { data: rows } = await useFetch<ServiceRow[]>('/api/content/services', {
  query: { limit: data.limit, onlyFeatured: data.onlyFeatured },
})

const mediaIds = computed(() => rows.value?.map((row) => row.iconOrMediaId).filter((id): id is string => Boolean(id)) ?? [])
const { data: mediaMap } = await useAsyncData(
  () => `service-cards-icons-${mediaIds.value.join(',')}`,
  () => fetchMediaMap(mediaIds.value),
)
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>

    <div v-if="rows?.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="service in rows"
        :key="service.id"
        :to="`/services/${service.slug[locale] ?? service.slug.de}`"
        class="group rounded-button border border-slate-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <img
          v-if="service.iconOrMediaId && mediaMap?.[service.iconOrMediaId]"
          :src="mediaUrl(mediaMap[service.iconOrMediaId], 'thumb')"
          :alt="mediaAlt(mediaMap[service.iconOrMediaId], locale)"
          width="48"
          height="48"
          loading="lazy"
          class="mb-4 h-12 w-12 object-contain"
        >
        <div v-else class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wrench class="h-6 w-6" />
        </div>
        <h3 class="font-semibold text-text group-hover:text-primary">{{ pickTranslated(service.title, locale) }}</h3>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(service.shortDescription, locale) }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-10 text-center text-text/50">{{ t('blocks.noServicesYet') }}</p>
  </section>
</template>
