<script setup lang="ts">
import type { z } from 'zod'
import { Star } from '@lucide/vue'
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
  <section class="mx-auto max-w-6xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="font-heading text-fluid-h2 font-bold text-text">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>

    <div v-if="rows?.length && data.variant === 'scroll'" class="mt-10 -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
      <blockquote
        v-for="item in rows"
        :key="item.id"
        class="w-[280px] shrink-0 snap-start rounded-card border border-border bg-surface p-6 shadow-card sm:w-[340px]"
      >
        <div v-if="item.rating" class="mb-3 flex gap-0.5 text-accent">
          <Star v-for="i in 5" :key="i" class="h-4 w-4" :class="i <= item.rating ? 'fill-current' : 'fill-none opacity-30'" aria-hidden="true" />
        </div>
        <p class="text-sm text-text/80">&ldquo;{{ pickTranslated(item.text, locale) }}&rdquo;</p>
        <footer class="mt-4 text-sm font-semibold text-text">{{ item.authorName }}</footer>
      </blockquote>
    </div>

    <div v-else-if="rows?.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <blockquote v-for="item in rows" :key="item.id" class="rounded-card border border-border bg-surface p-6 shadow-card">
        <div v-if="item.rating" class="mb-3 flex gap-0.5 text-accent">
          <Star v-for="i in 5" :key="i" class="h-4 w-4" :class="i <= item.rating ? 'fill-current' : 'fill-none opacity-30'" aria-hidden="true" />
        </div>
        <p class="text-sm text-text/80">&ldquo;{{ pickTranslated(item.text, locale) }}&rdquo;</p>
        <footer class="mt-4 text-sm font-semibold text-text">{{ item.authorName }}</footer>
      </blockquote>
    </div>
  </section>
</template>
