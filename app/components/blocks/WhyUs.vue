<script setup lang="ts">
import type { z } from 'zod'
import { ShieldCheck } from '@lucide/vue'
import type { whyUsBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof whyUsBlockSchema>['data'] }>()
const { locale } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>
    <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="(feature, index) in data.features" :key="index" class="text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <component :is="feature.icon && FEATURE_ICONS[feature.icon] ? FEATURE_ICONS[feature.icon] : ShieldCheck" class="h-6 w-6" />
        </div>
        <h3 class="font-semibold text-text">{{ pickTranslated(feature.title, locale) }}</h3>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(feature.description, locale) }}</p>
      </div>
    </div>
  </section>
</template>
