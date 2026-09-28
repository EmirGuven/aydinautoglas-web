<script setup lang="ts">
import type { z } from 'zod'
import type { certificatesBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof certificatesBlockSchema>['data'] }>()
const { locale } = useI18n()

const mediaIds = computed(() => data.items.map((item) => item.mediaId).filter((id): id is string => Boolean(id)))
const { data: mediaMap } = await useAsyncData(
  () => `certificates-media-${mediaIds.value.join(',')}`,
  () => fetchMediaMap(mediaIds.value),
)
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>
    <div class="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="(item, index) in data.items" :key="index" class="flex flex-col items-center text-center">
        <img
          v-if="item.mediaId"
          :src="mediaUrl(mediaMap?.[item.mediaId], 'thumb')"
          :alt="mediaAlt(mediaMap?.[item.mediaId], locale)"
          loading="lazy"
          width="96"
          height="96"
          class="h-24 w-24 object-contain"
        >
        <p class="mt-2 text-sm font-medium text-text">{{ pickTranslated(item.title, locale) }}</p>
        <p v-if="pickTranslated(item.issuer, locale)" class="text-xs text-text/60">{{ pickTranslated(item.issuer, locale) }}</p>
      </div>
    </div>
  </section>
</template>
