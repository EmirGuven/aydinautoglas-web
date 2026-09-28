<script setup lang="ts">
import type { z } from 'zod'
import type { ctaBandBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof ctaBandBlockSchema>['data'] }>()
const { locale } = useI18n()
</script>

<template>
  <section class="bg-primary px-4 py-12 text-center text-white">
    <h2 class="text-2xl font-bold sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
    <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 opacity-90">
      {{ pickTranslated(data.subheading, locale) }}
    </p>
    <a
      :href="data.ctaHref"
      class="mt-6 inline-flex min-h-11 items-center justify-center rounded-button bg-white px-6 text-sm font-semibold text-primary"
    >
      {{ pickTranslated(data.ctaLabel, locale) }}
    </a>
  </section>
</template>
