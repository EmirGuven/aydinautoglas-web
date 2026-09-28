<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface SeoValue {
  metaTitle?: string
  metaDescription?: string
  noindex?: boolean
  focusKeyword?: string
  shortAnswer?: string
  ogImageMediaId?: string
}

interface BulkSeoRow {
  contentType: 'page' | 'service' | 'blogPost'
  id: string
  title: Record<string, string>
  seo: Record<string, SeoValue>
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows } = await useFetch<BulkSeoRow[]>('/api/admin/bulk-seo')

const savingIds = reactive<Record<string, boolean>>({})

const contentTypeLabels: Record<string, string> = {
  page: t('seoReport.contentTypePage'),
  service: t('seoReport.contentTypeService'),
  blogPost: t('seoReport.contentTypeBlogPost'),
}

const endpointFor: Record<BulkSeoRow['contentType'], (id: string) => string> = {
  page: (id) => `/api/admin/pages/${id}`,
  service: (id) => `/api/admin/services/${id}`,
  blogPost: (id) => `/api/admin/blog/posts/${id}`,
}

async function saveRow(row: BulkSeoRow) {
  savingIds[row.id] = true
  try {
    await $fetch(endpointFor[row.contentType](row.id), { method: 'PATCH', body: { seo: row.seo } })
    toast.success(t('bulkSeo.rowSaved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('bulkSeo.rowSaveFailed')))
  } finally {
    savingIds[row.id] = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('bulkSeo.title') }}</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('bulkSeo.intro') }}</p>

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2">{{ t('bulkSeo.type') }}</th>
            <th class="px-3 py-2">{{ t('bulkSeo.titleColumn') }}</th>
            <th class="px-3 py-2">{{ t('bulkSeo.metaTitleColumn') }}</th>
            <th class="px-3 py-2">{{ t('bulkSeo.metaDescriptionColumn') }}</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="`${row.contentType}-${row.id}`" class="border-t border-slate-100 dark:border-slate-700">
            <td class="px-3 py-2 align-top text-xs text-slate-500">{{ contentTypeLabels[row.contentType] }}</td>
            <td class="px-3 py-2 align-top text-slate-700 dark:text-slate-200">{{ row.title.de }}</td>
            <td class="px-3 py-2 align-top">
              <input
                v-model="(row.seo.de ??= {}).metaTitle"
                class="min-h-9 w-48 rounded-md border border-slate-300 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
            </td>
            <td class="px-3 py-2 align-top">
              <input
                v-model="(row.seo.de ??= {}).metaDescription"
                class="min-h-9 w-64 rounded-md border border-slate-300 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
            </td>
            <td class="px-3 py-2 align-top">
              <button
                type="button"
                class="min-h-9 rounded-md bg-indigo-600 px-3 text-xs font-medium text-white disabled:opacity-60"
                :disabled="savingIds[row.id]"
                @click="saveRow(row)"
              >
                {{ t('common.save') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
