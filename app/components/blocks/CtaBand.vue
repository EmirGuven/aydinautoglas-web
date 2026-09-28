<script setup lang="ts">
import type { z } from 'zod'
import type { ctaBandBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof ctaBandBlockSchema>['data'] }>()
const { locale } = useI18n()
const localePath = useLocalePath()

const ctaHref = computed(() => (data.ctaHref?.startsWith('/') ? localePath(data.ctaHref) : data.ctaHref))
</script>

<template>
  <section class="bg-primary px-4 py-14 text-center text-white">
    <h2 class="font-heading text-fluid-h2 font-bold uppercase tracking-tight">{{ pickTranslated(data.heading, locale) }}</h2>
    <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 opacity-90">
      {{ pickTranslated(data.subheading, locale) }}
    </p>
    <a
      :href="ctaHref"
      class="mt-6 inline-flex min-h-12 items-center justify-center rounded-button bg-accent px-8 text-sm font-bold uppercase tracking-wide text-secondary shadow-elevated transition hover:brightness-105"
    >
      {{ pickTranslated(data.ctaLabel, locale) }}
    </a>
  </section>
</template>
