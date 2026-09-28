<script setup lang="ts">
import type { z } from 'zod'
import { CheckCircle } from '@lucide/vue'
import type { heroBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof heroBlockSchema>['data'] }>()
const { locale } = useI18n()

const { data: mediaMap } = await useAsyncData(
  () => `hero-media-${data.backgroundMediaId ?? 'none'}`,
  () => fetchMediaMap([data.backgroundMediaId]),
)

const bgUrl = computed(() => mediaUrl(mediaMap.value?.[data.backgroundMediaId ?? ''], 'large'))

// Hero renders above the fold, so preload its background image (prompt.md §8) — it's a CSS
// background, not an <img>, so the browser wouldn't otherwise discover it until it parses
// this component's stylesheet.
useHead(() => (bgUrl.value ? { link: [{ rel: 'preload', as: 'image', href: bgUrl.value, key: 'hero-preload' }] } : {}))
</script>

<template>
  <section
    class="relative flex min-h-[420px] items-center overflow-hidden bg-secondary bg-cover bg-center px-4 py-16 text-white sm:min-h-[520px]"
    :style="bgUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(${bgUrl})` } : undefined"
  >
    <!-- Decorative fallback when no editor-chosen background image is set, so the section
         never reads as a flat, unstyled block of color. -->
    <div
      v-if="!bgUrl"
      class="pointer-events-none absolute inset-0 opacity-20"
      style="background-image: radial-gradient(circle at 15% 20%, white 0, white 2px, transparent 2px), radial-gradient(circle at 85% 75%, white 0, white 2px, transparent 2px), radial-gradient(circle at 50% 50%, white 0, white 1px, transparent 1px); background-size: 120px 120px, 160px 160px, 60px 60px;"
    />
    <div class="relative mx-auto max-w-3xl text-center">
      <h1 class="text-3xl font-bold tracking-tight sm:text-5xl">{{ pickTranslated(data.heading, locale) }}</h1>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-4 text-lg opacity-90">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
      <a
        v-if="data.ctaHref && pickTranslated(data.ctaLabel, locale)"
        :href="data.ctaHref"
        class="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
      >
        {{ pickTranslated(data.ctaLabel, locale) }}
      </a>
      <ul v-if="data.badges.length" class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <li v-for="(badge, index) in data.badges" :key="index" class="flex items-center gap-2 text-sm font-medium">
          <CheckCircle class="h-4 w-4 shrink-0 text-primary" />
          {{ pickTranslated(badge, locale) }}
        </li>
      </ul>
    </div>
  </section>
</template>
