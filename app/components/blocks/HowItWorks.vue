<script setup lang="ts">
import type { z } from 'zod'
import type { howItWorksBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof howItWorksBlockSchema>['data'] }>()
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
    <ol class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
      <li v-for="(step, index) in data.steps" :key="index" class="text-center">
        <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {{ index + 1 }}
        </div>
        <h3 class="mt-4 font-semibold text-text">{{ pickTranslated(step.title, locale) }}</h3>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(step.description, locale) }}</p>
      </li>
    </ol>
  </section>
</template>
