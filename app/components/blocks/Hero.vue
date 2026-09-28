<script setup lang="ts">
import type { z } from 'zod'
import { CheckCircle, Phone } from '@lucide/vue'
import type { heroBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof heroBlockSchema>['data'] }>()
const { locale } = useI18n()
const { data: settings } = await usePublicSettings()

const { data: mediaMap } = await useAsyncData(
  () => `hero-media-${data.backgroundMediaId ?? 'none'}`,
  () => fetchMediaMap([data.backgroundMediaId]),
)

const bgUrl = computed(() => mediaUrl(mediaMap.value?.[data.backgroundMediaId ?? ''], 'large'))
const phone = computed(() => settings.value?.contact?.phone)

// Hero renders above the fold, so preload its background image (prompt.md §8) — it's a CSS
// background, not an <img>, so the browser wouldn't otherwise discover it until it parses
// this component's stylesheet.
useHead(() => (bgUrl.value ? { link: [{ rel: 'preload', as: 'image', href: bgUrl.value, key: 'hero-preload' }] } : {}))
</script>

<template>
  <section
    class="relative flex min-h-[480px] items-center overflow-hidden bg-secondary bg-cover bg-center px-4 py-16 text-white sm:min-h-[560px]"
    :style="bgUrl ? { backgroundImage: `linear-gradient(rgba(15,23,32,0.55),rgba(15,23,32,0.7)), url(${bgUrl})` } : undefined"
  >
    <!-- Decorative fallback when no editor-chosen background image is set: a technical
         blueprint-grid pattern (Werkstatt Präzision direction) rather than a generic
         soft dot pattern, so the section still reads as "precision auto-glass work"
         even with zero photography. -->
    <div
      v-if="!bgUrl"
      class="pointer-events-none absolute inset-0 opacity-[0.15]"
      style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 48px 48px;"
    />
    <div
      v-if="!bgUrl"
      class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-accent/30"
    />

    <div class="relative mx-auto max-w-3xl text-center">
      <h1 class="text-fluid-h1 font-heading font-bold uppercase tracking-tight">{{ pickTranslated(data.heading, locale) }}</h1>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-4 text-fluid-body opacity-90">
        {{ pickTranslated(data.subheading, locale) }}
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          v-if="data.ctaHref && pickTranslated(data.ctaLabel, locale)"
          :href="data.ctaHref"
          class="inline-flex min-h-12 items-center justify-center rounded-button bg-accent px-8 text-sm font-bold uppercase tracking-wide text-secondary shadow-elevated transition hover:brightness-105"
        >
          {{ pickTranslated(data.ctaLabel, locale) }}
        </a>
        <a
          v-if="phone"
          :href="`tel:${phone}`"
          class="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <Phone class="h-4 w-4" aria-hidden="true" />
          {{ phone }}
        </a>
      </div>

      <ul v-if="data.badges.length" class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <li v-for="(badge, index) in data.badges" :key="index" class="flex items-center gap-2 text-sm font-medium">
          <CheckCircle class="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          {{ pickTranslated(badge, locale) }}
        </li>
      </ul>
    </div>
  </section>
</template>
