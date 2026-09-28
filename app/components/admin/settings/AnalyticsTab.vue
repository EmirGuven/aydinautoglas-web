<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('analytics', {
  googleAnalyticsId: '',
  turnstileEnabled: false,
})

onMounted(load)

async function onSave() {
  try {
    await save()
    toast.success(t('common.saved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.saveFailed')))
  }
}
</script>

<template>
  <form v-if="!loading" class="flex max-w-lg flex-col gap-4" @submit.prevent="onSave">
    <AdminFormField :label="t('settings.analytics.gaId')" :hint="t('settings.analytics.gaHint')">
      <input
        v-model="value.googleAnalyticsId"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.analytics.turnstile')">
      <label class="flex items-center gap-2 text-sm">
        <input v-model="value.turnstileEnabled" type="checkbox">
        {{ t('settings.analytics.turnstileEnable') }}
      </label>
    </AdminFormField>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
