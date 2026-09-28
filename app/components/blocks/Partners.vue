<script setup lang="ts">
import type { z } from 'zod'
import type { partnersBlockSchema } from '#shared/schemas/blocks'

interface PartnerRow {
  id: string
  name: string
  logoMediaId: string
  websiteUrl: string | null
}

const { data } = defineProps<{ data: z.infer<typeof partnersBlockSchema>['data'] }>()
const { locale } = useI18n()

const { data: rows } = await useFetch<PartnerRow[]>('/api/content/partners')
const { data: mediaMap } = await useAsyncData(
  () => `partners-media-${rows.value?.map((r) => r.logoMediaId).join(',') ?? ''}`,
  () => fetchMediaMap(rows.value?.map((r) => r.logoMediaId) ?? []),
)
</script>

<template>
  <section v-if="rows?.length" class="mx-auto max-w-5xl px-4 py-12">
    <h2 v-if="data.heading && pickTranslated(data.heading, locale)" class="mb-8 text-center text-xl font-semibold text-text">
      {{ pickTranslated(data.heading, locale) }}
    </h2>
    <div class="flex flex-wrap items-center justify-center gap-8">
      <a
        v-for="partner in rows"
        :key="partner.id"
        :href="partner.websiteUrl || undefined"
        class="opacity-70 hover:opacity-100"
      >
        <img
          :src="mediaUrl(mediaMap?.[partner.logoMediaId], 'thumb')"
          :alt="partner.name"
          loading="lazy"
          width="120"
          height="40"
          class="h-10 w-auto object-contain grayscale"
        >
      </a>
    </div>
  </section>
</template>
