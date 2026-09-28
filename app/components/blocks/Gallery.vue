<script setup lang="ts">
import type { z } from 'zod'
import type { galleryBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof galleryBlockSchema>['data'] }>()
const { locale } = useI18n()

const { data: mediaMap } = await useAsyncData(
  () => `gallery-media-${data.mediaIds.join(',')}`,
  () => fetchMediaMap(data.mediaIds),
)
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <h2 v-if="data.heading && pickTranslated(data.heading, locale)" class="mb-8 text-center text-2xl font-bold text-text">
      {{ pickTranslated(data.heading, locale) }}
    </h2>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <img
        v-for="id in data.mediaIds"
        :key="id"
        :src="mediaUrl(mediaMap?.[id], 'medium')"
        :alt="mediaAlt(mediaMap?.[id], locale)"
        loading="lazy"
        width="400"
        height="400"
        class="aspect-square w-full rounded-button object-cover"
      >
    </div>
  </section>
</template>
