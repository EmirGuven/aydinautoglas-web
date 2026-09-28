<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('smtp', {
  host: '',
  port: 587,
  user: '',
  password: '',
  from: '',
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
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ t('settings.smtp.intro') }}
    </p>
    <AdminFormField :label="t('settings.smtp.host')">
      <input
        v-model="value.host"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.smtp.port')">
      <input
        v-model.number="value.port"
        type="number"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.smtp.username')">
      <input
        v-model="value.user"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.smtp.password')">
      <input
        v-model="value.password"
        type="password"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.smtp.fromAddress')">
      <input
        v-model="value.from"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
