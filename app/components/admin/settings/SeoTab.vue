<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('seoDefaults', {
  titleSuffix: {} as Record<string, string>,
  defaultDescription: {} as Record<string, string>,
  ogImageMediaId: undefined as string | undefined,
  markdownExportEnabled: true,
})

const {
  value: indexNow,
  loading: indexNowLoading,
  saving: indexNowSaving,
  load: loadIndexNow,
  save: saveIndexNow,
} = useSetting('indexNow', { enabled: false, key: '' })

onMounted(() => {
  load()
  loadIndexNow()
})

async function onSave() {
  try {
    await save()
    toast.success(t('common.saved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.saveFailed')))
  }
}

async function onSaveIndexNow() {
  try {
    await saveIndexNow()
    await loadIndexNow()
    toast.success(t('common.saved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.saveFailed')))
  }
}
</script>

<template>
  <form v-if="!loading" class="flex max-w-lg flex-col gap-4" @submit.prevent="onSave">
    <AdminFormField :label="t('settings.seo.titleSuffix')" :hint="t('settings.seo.titleSuffixHint')">
      <input
        v-model="value.titleSuffix.de"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.seo.defaultDescription')">
      <textarea
        v-model="value.defaultDescription.de"
        rows="3"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </AdminFormField>
    <AdminFormField :label="t('settings.seo.ogImage')">
      <AdminMediaPicker v-model="value.ogImageMediaId" />
    </AdminFormField>
    <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input v-model="value.markdownExportEnabled" type="checkbox">
      {{ t('settings.seo.markdownExportEnabled') }}
    </label>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>

  <form v-if="!indexNowLoading" class="mt-8 flex max-w-lg flex-col gap-4 border-t border-slate-200 pt-8 dark:border-slate-700" @submit.prevent="onSaveIndexNow">
    <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('settings.seo.indexNowTitle') }}</h3>
    <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('settings.seo.indexNowIntro') }}</p>
    <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input v-model="indexNow.enabled" type="checkbox">
      {{ t('settings.seo.indexNowEnabled') }}
    </label>
    <AdminFormField v-if="indexNow.key" :label="t('settings.seo.indexNowKey')">
      <input :value="indexNow.key" readonly class="min-h-11 rounded-md border border-slate-300 bg-slate-50 px-3 font-mono text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
      <p class="mt-1 text-xs text-slate-400">
        {{ t('settings.seo.indexNowKeyHint') }} <a :href="`/${indexNow.key}.txt`" target="_blank" class="text-indigo-600 underline">/{{ indexNow.key }}.txt</a>
      </p>
    </AdminFormField>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60" :disabled="indexNowSaving">
      {{ indexNowSaving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
