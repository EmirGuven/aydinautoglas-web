<script setup lang="ts">
import type { z } from 'zod'
import type { blogPreviewBlockSchema } from '#shared/schemas/blocks'

interface BlogPostRow {
  id: string
  title: Record<string, string>
  excerpt: Record<string, string>
  slug: Record<string, string>
  coverMediaId?: string
}

const { data } = defineProps<{ data: z.infer<typeof blogPreviewBlockSchema>['data'] }>()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data: rows } = await useFetch<BlogPostRow[]>('/api/content/blog-posts', {
  query: { locale, limit: data.limit },
})

const { data: mediaMap } = await useAsyncData(
  () => `blog-preview-covers-${rows.value?.map((p) => p.coverMediaId).join(',') ?? ''}`,
  () => fetchMediaMap(rows.value?.map((p) => p.coverMediaId) ?? []),
)
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="font-heading text-fluid-h2 font-bold text-text">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>
    <div v-if="rows?.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <NuxtLink
        v-for="post in rows"
        :key="post.id"
        :to="localePath(`/blog/${post.slug[locale] ?? post.slug.de}`)"
        class="group overflow-hidden rounded-card border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
      >
        <img
          v-if="mediaMap?.[post.coverMediaId ?? '']"
          :src="mediaUrl(mediaMap[post.coverMediaId ?? ''], 'medium')"
          :alt="mediaAlt(mediaMap[post.coverMediaId ?? ''], locale)"
          width="800"
          height="450"
          loading="lazy"
          class="aspect-video w-full object-cover"
        >
        <div v-else class="aspect-video w-full bg-secondary/5" />
        <div class="p-6">
          <h3 class="font-heading font-semibold text-text group-hover:text-primary">{{ pickTranslated(post.title, locale) }}</h3>
          <p class="mt-2 text-sm text-text/70">{{ pickTranslated(post.excerpt, locale) }}</p>
        </div>
      </NuxtLink>
    </div>
    <p v-else class="mt-10 text-center text-muted">{{ t('blocks.noBlogPostsYet') }}</p>
  </section>
</template>
