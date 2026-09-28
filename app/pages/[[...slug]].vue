<script setup lang="ts">
import type { Block } from '#shared/schemas/blocks'

interface PageResponse {
  page: {
    id: string
    slug: Record<string, string>
    title: Record<string, string>
    seo: Record<string, { metaTitle?: string; metaDescription?: string; noindex?: boolean; shortAnswer?: string }>
  }
  blocks: Block[]
}

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw.join('/') : (raw ?? '')
})

const { data, error } = await useFetch<PageResponse>('/api/pages', {
  query: { locale, slug },
  key: () => `page-${locale.value}-${slug.value}`,
})

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const seo = computed(() => data.value?.page.seo[locale.value] ?? {})
useSeoMeta({
  title: () => seo.value.metaTitle || pickTranslated(data.value?.page.title, locale.value),
  description: () => seo.value.metaDescription,
  robots: () => (seo.value.noindex ? 'noindex' : undefined),
})

const localizedPaths = computed(() =>
  data.value
    ? Object.fromEntries(
        Object.entries(data.value.page.slug)
          .filter(([, pageSlug]) => pageSlug !== undefined)
          .map(([code, pageSlug]) => [code, localePath(`/${pageSlug}`, code as never)]),
      )
    : undefined,
)
useLocaleSeo(localizedPaths)
syncContentLocalePaths(localizedPaths)
</script>

<template>
  <div v-if="data">
    <p v-if="seo.shortAnswer" class="mx-auto max-w-3xl px-4 pt-8 text-lg text-text/80">
      {{ seo.shortAnswer }}
    </p>
    <BlocksRenderer :blocks="data.blocks" />
  </div>
</template>
