<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface MissingMetaItem {
  contentType: 'page' | 'service' | 'blogPost'
  id: string
  title: string
  locale: string
  missingTitle: boolean
  missingDescription: boolean
}

interface DuplicateGroup {
  field: 'metaTitle' | 'metaDescription'
  value: string
  items: { contentType: string; id: string; title: string }[]
}

interface SeoReport {
  missingMeta: MissingMetaItem[]
  missingAltText: { id: string; originalFileName: string }[]
  duplicates: DuplicateGroup[]
  topNotFoundPaths: { path: string; hitCount: number }[]
}

const { t } = useAdminI18n()
const { data: report } = await useFetch<SeoReport>('/api/admin/seo-report')

const contentTypeLabels: Record<string, string> = {
  page: t('seoReport.contentTypePage'),
  service: t('seoReport.contentTypeService'),
  blogPost: t('seoReport.contentTypeBlogPost'),
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('seoReport.title') }}</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('seoReport.intro') }}</p>

    <div class="mt-6 flex flex-col gap-6">
      <section class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ t('seoReport.missingMetaTitle') }}</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ t('seoReport.missingMetaIntro') }}</p>
        <ul v-if="report?.missingMeta.length" class="mt-3 flex flex-col gap-2">
          <li v-for="(item, index) in report.missingMeta" :key="`${item.contentType}-${item.id}-${item.locale}-${index}`" class="flex items-center gap-2 text-sm">
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">{{ contentTypeLabels[item.contentType] }}</span>
            <span class="text-slate-700 dark:text-slate-200">{{ item.title }}</span>
            <span class="text-xs text-slate-400">({{ item.locale }})</span>
            <span v-if="item.missingTitle" class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{{ t('seoReport.missingTitleBadge') }}</span>
            <span v-if="item.missingDescription" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{{ t('seoReport.missingDescriptionBadge') }}</span>
          </li>
        </ul>
        <p v-else class="mt-3 text-sm text-emerald-600">{{ t('seoReport.noMissingMeta') }}</p>
      </section>

      <section class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ t('seoReport.missingAltTextTitle') }}</h2>
        <ul v-if="report?.missingAltText.length" class="mt-3 flex flex-col gap-1">
          <li v-for="item in report.missingAltText" :key="item.id" class="text-sm text-slate-700 dark:text-slate-200">{{ item.originalFileName }}</li>
        </ul>
        <p v-else class="mt-3 text-sm text-emerald-600">{{ t('seoReport.noMissingAltText') }}</p>
      </section>

      <section class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ t('seoReport.duplicatesTitle') }}</h2>
        <ul v-if="report?.duplicates.length" class="mt-3 flex flex-col gap-3">
          <li v-for="(group, index) in report.duplicates" :key="index" class="text-sm">
            <p class="text-slate-500 dark:text-slate-400">"{{ group.value }}" ({{ group.field }})</p>
            <p class="text-slate-700 dark:text-slate-200">{{ group.items.map((i) => i.title).join(', ') }}</p>
          </li>
        </ul>
        <p v-else class="mt-3 text-sm text-emerald-600">{{ t('seoReport.noDuplicates') }}</p>
      </section>

      <section class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ t('seoReport.notFoundTitle') }}</h2>
        <ul v-if="report?.topNotFoundPaths.length" class="mt-3 flex flex-col gap-1">
          <li v-for="item in report.topNotFoundPaths" :key="item.path" class="flex justify-between text-sm text-slate-700 dark:text-slate-200">
            <span class="font-mono text-xs">{{ item.path }}</span>
            <span>{{ item.hitCount }}</span>
          </li>
        </ul>
        <p v-else class="mt-3 text-sm text-emerald-600">{{ t('seoReport.noNotFound') }}</p>
      </section>
    </div>
  </div>
</template>
