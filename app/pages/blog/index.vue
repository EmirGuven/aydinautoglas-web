<script setup lang="ts">
interface BlogPostRow {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  excerpt: Record<string, string>
}

const { locale } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useFetch<BlogPostRow[]>('/api/content/blog-posts', { query: { locale, limit: 100 } })

useSeoMeta({ title: () => 'Blog' })
useLocaleSeo()
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">Blog</h1>
    <div v-if="rows?.length" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <NuxtLink
        v-for="post in rows"
        :key="post.id"
        :to="localePath(`/blog/${post.slug[locale] ?? post.slug.de}`)"
        class="rounded-button border border-slate-200 p-6 hover:border-primary"
      >
        <h2 class="font-semibold text-text">{{ pickTranslated(post.title, locale) }}</h2>
        <p class="mt-2 text-sm text-text/70">{{ pickTranslated(post.excerpt, locale) }}</p>
      </NuxtLink>
    </div>
    <p v-else class="mt-8 text-text/50">No blog posts published yet.</p>
  </main>
</template>
