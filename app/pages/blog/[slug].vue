<script setup lang="ts">
interface BlogPostSeoValue {
  metaTitle?: string
  metaDescription?: string
  noindex?: boolean
  shortAnswer?: string
}

interface BlogPostDetail {
  id: string
  slug: Record<string, string>
  publishedByLocale: Record<string, boolean>
  title: Record<string, string>
  excerpt: Record<string, string>
  content: Record<string, string>
  publishedAt: string | null
  updatedAt: string
  authorName?: string
  authorRole: Record<string, string>
  authorPhotoMediaId?: string
  shortAnswer: Record<string, string>
  seo: Record<string, BlogPostSeoValue>
}

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = route.params.slug as string

const { data: post, error } = await useFetch<BlogPostDetail>(`/api/blog/${slug}`, {
  query: { locale },
  key: () => `blog-post-${locale.value}-${slug}`,
})

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found', fatal: true })
}

const seo = computed(() => post.value?.seo[locale.value] ?? {})
const shortAnswer = computed(() => seo.value.shortAnswer || pickTranslated(post.value?.shortAnswer, locale.value))
const authorRoleText = computed(() => pickTranslated(post.value?.authorRole, locale.value))

const authorPhoto = ref<{ id: string; sizes: Record<string, string>; altText: Record<string, string> } | undefined>()
watchEffect(async () => {
  if (post.value?.authorPhotoMediaId) {
    const map = await fetchMediaMap([post.value.authorPhotoMediaId])
    authorPhoto.value = map[post.value.authorPhotoMediaId]
  } else {
    authorPhoto.value = undefined
  }
})

useSeoMeta({
  title: () => seo.value.metaTitle || pickTranslated(post.value?.title, locale.value),
  description: () => seo.value.metaDescription,
  robots: () => (seo.value.noindex ? 'noindex' : undefined),
})

const localizedPaths = computed(() =>
  post.value
    ? Object.fromEntries(
        Object.entries(post.value.slug)
          .filter(([code, s]) => s && post.value?.publishedByLocale[code])
          .map(([code, s]) => [code, localePath(`/blog/${s}`, code as never)]),
      )
    : undefined,
)
useLocaleSeo(localizedPaths)
syncContentLocalePaths(localizedPaths)

const { data: organization } = await useFetch('/api/json-ld/organization', { key: 'organization-json-ld' })
useJsonLd(() =>
  post.value
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: pickTranslated(post.value.title, locale.value),
        description: pickTranslated(post.value.excerpt, locale.value) || undefined,
        datePublished: post.value.publishedAt ?? undefined,
        dateModified: post.value.updatedAt,
        author: post.value.authorName
          ? { '@type': 'Person', name: post.value.authorName }
          : Array.isArray(organization.value)
            ? organization.value[0]
            : undefined,
        publisher: Array.isArray(organization.value) ? organization.value[0] : undefined,
      }
    : null,
)
useBreadcrumbJsonLd(() =>
  post.value
    ? [
        { name: 'Blog', path: localePath('/blog') },
        { name: pickTranslated(post.value.title, locale.value), path: localePath(`/blog/${slug}`) },
      ]
    : undefined,
)
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">{{ pickTranslated(post?.title, locale) }}</h1>

    <div v-if="post?.authorName || post?.publishedAt" class="mt-3 flex items-center gap-3 text-sm text-text/60">
      <img
        v-if="authorPhoto"
        :src="mediaUrl(authorPhoto, 'thumb')"
        :alt="post?.authorName ?? ''"
        width="32"
        height="32"
        class="h-8 w-8 rounded-full object-cover"
        loading="lazy"
      >
      <div>
        <p v-if="post?.authorName">
          <span class="font-medium text-text">{{ post.authorName }}</span>
          <span v-if="authorRoleText"> · {{ authorRoleText }}</span>
        </p>
        <p class="text-xs">
          <span v-if="post?.publishedAt">{{ t('blogPost.publishedOn') }} <time :datetime="post.publishedAt">{{ new Date(post.publishedAt).toLocaleDateString(locale) }}</time></span>
          <span v-if="post?.updatedAt"> · {{ t('blogPost.updatedOn') }} <time :datetime="post.updatedAt">{{ new Date(post.updatedAt).toLocaleDateString(locale) }}</time></span>
        </p>
      </div>
    </div>

    <p v-if="shortAnswer" class="mt-4 text-lg text-text/80">{{ shortAnswer }}</p>

    <!-- eslint-disable-next-line vue/no-v-html -- sanitized server-side before storage -->
    <div class="prose mt-6 max-w-none text-text" v-html="pickTranslated(post?.content, locale)" />
  </main>
</template>
