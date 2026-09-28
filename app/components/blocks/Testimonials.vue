<script setup lang="ts">
import type { z } from 'zod'
import type { testimonialsBlockSchema } from '#shared/schemas/blocks'

interface TestimonialRow {
  id: string
  authorName: string
  rating: number
  text: Record<string, string>
}

const { data } = defineProps<{ data: z.infer<typeof testimonialsBlockSchema>['data'] }>()
const { locale } = useI18n()

const { data: rows } = await useFetch<TestimonialRow[]>('/api/content/testimonials', {
  query: { limit: data.limit },
})
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>
    <div v-if="rows?.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <blockquote v-for="item in rows" :key="item.id" class="rounded-button border border-slate-200 p-6">
        <p class="text-sm text-text/80">&ldquo;{{ pickTranslated(item.text, locale) }}&rdquo;</p>
        <footer class="mt-4 text-sm font-semibold text-text">{{ item.authorName }}</footer>
      </blockquote>
    </div>
  </section>
</template>
