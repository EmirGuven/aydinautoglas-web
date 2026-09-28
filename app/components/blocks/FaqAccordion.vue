<script setup lang="ts">
import type { z } from 'zod'
import type { faqAccordionBlockSchema } from '#shared/schemas/blocks'

interface FaqRow {
  id: string
  categoryId?: string
  question: Record<string, string>
  answer: Record<string, string>
}

interface FaqCategoryRow {
  id: string
  name: Record<string, string>
}

const { data } = defineProps<{ data: z.infer<typeof faqAccordionBlockSchema>['data'] }>()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data: rows } = await useFetch<FaqRow[]>('/api/content/faqs', {
  query: { categoryId: data.categoryId },
})

// The rich tabbed/search layout only makes sense when the block covers every category at
// once (the common case — no categoryId set on the block). A block deliberately scoped to one
// category keeps the simpler flat accordion, since there's nothing to switch between.
const { data: categories } = await useFetch<FaqCategoryRow[]>('/api/content/faq-categories', {
  immediate: !data.categoryId,
})

const generalCategoryLabel = computed(() => t('faqBlock.generalCategory'))

const groups = computed(() => {
  if (data.categoryId || !categories.value) return []
  const named = categories.value
    .map((category) => ({ category, items: (rows.value ?? []).filter((row) => row.categoryId === category.id) }))
    .filter((group) => group.items.length > 0)
  const uncategorized = (rows.value ?? []).filter((row) => !row.categoryId)
  if (uncategorized.length === 0) return named
  return [...named, { category: { id: '__general__', name: { de: generalCategoryLabel.value } }, items: uncategorized }]
})

// With zero or one real topic, tabs have nothing to switch between — show a plain accordion.
const showTabs = computed(() => groups.value.length > 1)

const searchQuery = ref('')
const activeCategoryId = ref<string | null>(null)
const openId = ref<string | null>(null)

watch(
  groups,
  (value) => {
    if (value.length && activeCategoryId.value === null) {
      activeCategoryId.value = value[0]?.category.id ?? null
    }
  },
  { immediate: true },
)

const activeGroup = computed(() => groups.value.find((group) => group.category.id === activeCategoryId.value) ?? groups.value[0])

const isSearching = computed(() => searchQuery.value.trim().length > 0)
const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  const results: { categoryName: string; item: FaqRow }[] = []
  for (const group of groups.value) {
    for (const item of group.items) {
      const question = pickTranslated(item.question, locale.value).toLowerCase()
      const answer = pickTranslated(item.answer, locale.value).toLowerCase()
      if (question.includes(query) || answer.includes(query)) {
        results.push({ categoryName: pickTranslated(group.category.name, locale.value), item })
      }
    }
  }
  return results
})

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}

function selectCategory(id: string) {
  activeCategoryId.value = id
  openId.value = null
  searchQuery.value = ''
}

useJsonLd(() =>
  rows.value?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: rows.value.map((faq) => ({
          '@type': 'Question',
          name: pickTranslated(faq.question, locale.value),
          acceptedAnswer: { '@type': 'Answer', text: pickTranslated(faq.answer, locale.value) },
        })),
      }
    : null,
)
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>

    <!-- Scoped to a single category: keep the simple flat accordion, nothing to switch between. -->
    <div v-if="data.categoryId" class="mt-8 divide-y divide-slate-200 border-y border-slate-200">
      <div v-for="faq in rows" :key="faq.id">
        <button
          type="button"
          class="flex min-h-11 w-full items-center justify-between py-4 text-left font-medium text-text"
          @click="toggle(faq.id)"
        >
          {{ pickTranslated(faq.question, locale) }}
          <span>{{ openId === faq.id ? '−' : '+' }}</span>
        </button>
        <p v-if="openId === faq.id" class="pb-4 text-sm text-text/70">
          {{ pickTranslated(faq.answer, locale) }}
        </p>
      </div>
    </div>

    <!-- Full "help center" layout: search + category tabs + accordion. -->
    <template v-else>
      <div class="mx-auto mt-8 max-w-xl">
        <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-primary">
          <svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('faqBlock.searchPlaceholder')"
            class="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:appearance-none"
          >
          <button v-if="searchQuery" type="button" class="shrink-0 text-slate-400 hover:text-slate-600" @click="searchQuery = ''">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      <!-- Search mode: a flat result list replaces the tabs+panel layout entirely. -->
      <div v-if="isSearching" class="mx-auto mt-8 max-w-2xl">
        <div v-if="searchResults.length === 0" class="py-12 text-center text-text/60">
          <p class="font-medium text-text">{{ t('faqBlock.noResultsTitle', { query: searchQuery }) }}</p>
          <p class="mt-2 text-sm">{{ t('faqBlock.noResultsText') }}</p>
          <NuxtLink :to="localePath('/appointment')" class="mt-4 inline-block text-sm font-medium text-primary underline">
            {{ t('faqBlock.contactCta') }}
          </NuxtLink>
        </div>
        <div v-else class="flex flex-col gap-2">
          <p class="mb-2 text-sm text-text/60">{{ t('faqBlock.resultsCount', { count: searchResults.length, query: searchQuery }) }}</p>
          <div
            v-for="({ categoryName, item }) in searchResults"
            :key="item.id"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition"
            :class="openId === item.id ? 'border-primary shadow-md' : 'hover:shadow-sm'"
          >
            <button type="button" class="flex w-full items-center gap-3 px-4 py-3.5 text-left" @click="toggle(item.id)">
              <span class="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{{ categoryName }}</span>
              <span class="flex-1 text-sm font-semibold text-text">{{ pickTranslated(item.question, locale) }}</span>
              <svg class="h-4 w-4 shrink-0 text-slate-400 transition-transform" :class="openId === item.id && 'rotate-180 text-primary'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: openId === item.id ? '1fr' : '0fr' }">
              <div class="overflow-hidden">
                <p class="border-t border-slate-100 px-4 py-3.5 text-sm leading-relaxed text-text/70">{{ pickTranslated(item.answer, locale) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Default mode: category tabs (left, sticky on desktop only) + accordion (right). -->
      <div v-else class="mt-8 grid grid-cols-1 items-start gap-6" :class="showTabs && 'lg:grid-cols-[280px_minmax(0,1fr)]'">
        <nav v-if="showTabs" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
          <p class="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">{{ t('faqBlock.topicsLabel') }}</p>
          <button
            v-for="group in groups"
            :key="group.category.id"
            type="button"
            class="flex w-full items-center gap-2 border-l-[3px] px-4 py-3.5 text-left text-sm transition"
            :class="group.category.id === activeCategoryId
              ? 'border-primary bg-primary/10 font-semibold text-primary'
              : 'border-transparent text-text/70 hover:bg-slate-50'"
            @click="selectCategory(group.category.id)"
          >
            <span class="flex-1">{{ pickTranslated(group.category.name, locale) }}</span>
            <span
              class="rounded-full px-2 text-xs font-bold"
              :class="group.category.id === activeCategoryId ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'"
            >
              {{ group.items.length }}
            </span>
          </button>
        </nav>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
            <h3 class="text-lg font-bold text-text">{{ activeGroup ? pickTranslated(activeGroup.category.name, locale) : '' }}</h3>
            <span class="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {{ t('faqBlock.questionsCount', { count: activeGroup?.items.length ?? 0 }) }}
            </span>
          </div>

          <div class="grid gap-3">
            <div
              v-for="(item, index) in activeGroup?.items"
              :key="item.id"
              class="overflow-hidden rounded-2xl border border-slate-200 transition"
              :class="openId === item.id ? 'border-primary shadow-md' : 'hover:shadow-sm'"
            >
              <button type="button" class="flex w-full items-center gap-3 px-4 py-3.5 text-left" @click="toggle(item.id)">
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  :class="openId === item.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'"
                >
                  {{ index + 1 }}
                </span>
                <span class="flex-1 text-sm font-semibold text-text">{{ pickTranslated(item.question, locale) }}</span>
                <svg class="h-4 w-4 shrink-0 text-slate-400 transition-transform" :class="openId === item.id && 'rotate-180 text-primary'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: openId === item.id ? '1fr' : '0fr' }">
                <div class="overflow-hidden">
                  <p class="border-t border-slate-100 px-4 py-3.5 text-sm leading-relaxed text-text/70">{{ pickTranslated(item.answer, locale) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
