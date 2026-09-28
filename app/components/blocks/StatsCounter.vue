<script setup lang="ts">
import type { z } from 'zod'
import type { statsCounterBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof statsCounterBlockSchema>['data'] }>()
const { locale } = useI18n()
</script>

<template>
  <section class="bg-secondary px-4 py-12 text-white">
    <div class="mx-auto max-w-5xl">
      <h2 v-if="data.heading && pickTranslated(data.heading, locale)" class="mb-8 text-center text-2xl font-bold">
        {{ pickTranslated(data.heading, locale) }}
      </h2>
      <div class="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
        <div v-for="(stat, index) in data.stats" :key="index">
          <p class="text-3xl font-bold">{{ stat.value }}{{ stat.suffix }}</p>
          <p class="mt-1 text-sm opacity-80">{{ pickTranslated(stat.label, locale) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
