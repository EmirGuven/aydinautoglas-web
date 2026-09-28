<script setup lang="ts">
interface BlogPostRow {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  excerpt: Record<string, string>
  coverMediaId?: string
}

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useFetch<BlogPostRow[]>('/api/content/blog-posts', { query: { locale, limit: 100 } })

const { data: mediaMap } = await useAsyncData(
  () => `blog-list-covers-${rows.value?.map((p) => p.coverMediaId).join(',') ?? ''}`,
  () => fetchMediaMap(rows.value?.map((p) => p.coverMediaId) ?? []),
)

useSeoMeta({ title: () => t('listPages.blogTitle') })
useLocaleSeo()
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <h1 class="font-heading text-fluid-h1 font-bold text-text">{{ t('listPages.blogTitle') }}</h1>
    <div v-if="rows?.length" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <NuxtLink
        v-for="post in rows"
        :key="post.id"
        :to="localePath(`/blog/${post.slug[locale] ?? post.slug.de}`)"
        class="overflow-hidden rounded-card border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-elevated"
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
          <h2 class="font-heading font-semibold text-text">{{ pickTranslated(post.title, locale) }}</h2>
          <p class="mt-2 text-sm text-text/70">{{ pickTranslated(post.excerpt, locale) }}</p>
        </div>
      </NuxtLink>
    </div>
    <p v-else class="mt-8 text-muted">{{ t('listPages.blogEmpty') }}</p>
  </main>
</template>
