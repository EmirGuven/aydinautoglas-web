<script setup lang="ts">
import type { z } from 'zod'
import type { imageTextBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof imageTextBlockSchema>['data'] }>()
const { locale } = useI18n()

const { data: mediaMap } = await useAsyncData(
  () => `image-text-media-${data.mediaId ?? 'none'}`,
  () => fetchMediaMap([data.mediaId]),
)
const imgUrl = computed(() => mediaUrl(mediaMap.value?.[data.mediaId ?? ''], 'large'))
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div
      class="grid grid-cols-1 items-center gap-8 sm:grid-cols-2"
      :class="data.imagePosition === 'right' && 'sm:[&>*:first-child]:order-2'"
    >
      <img
        v-if="imgUrl"
        :src="imgUrl"
        :alt="mediaAlt(mediaMap?.[data.mediaId ?? ''], locale)"
        loading="lazy"
        width="600"
        height="400"
        class="w-full rounded-button object-cover"
      >
      <div>
        <h2 class="text-2xl font-bold text-text">{{ pickTranslated(data.heading, locale) }}</h2>
        <!-- eslint-disable-next-line vue/no-v-html -- sanitized server-side before storage -->
        <div class="prose mt-4 max-w-none text-text" v-html="pickTranslated(data.text, locale)" />
      </div>
    </div>
  </section>
</template>
