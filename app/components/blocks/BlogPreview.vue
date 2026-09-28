<script setup lang="ts">
import type { z } from 'zod'
import type { blogPreviewBlockSchema } from '#shared/schemas/blocks'

interface BlogPostRow {
  id: string
  title: Record<string, string>
  excerpt: Record<string, string>
  slug: Record<string, string>
}

const { data } = defineProps<{ data: z.infer<typeof blogPreviewBlockSchema>['data'] }>()
const { locale, t } = useI18n()

const { data: rows } = await useFetch<BlogPostRow[]>('/api/content/blog-posts', {
  query: { locale, limit: data.limit },
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
    <div v-if="rows?.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <NuxtLink
        v-for="post in rows"
        :key="post.id"
        :to="`/blog/${post.slug[locale] ?? post.slug.de}`"
        class="group rounded-button border border-slate-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <h3 class="font-semibold text-text group-hover:text-primary">{{ pickTranslated(post.title, locale) }}</h3>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(post.excerpt, locale) }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-10 text-center text-text/50">{{ t('blocks.noBlogPostsYet') }}</p>
  </section>
</template>
