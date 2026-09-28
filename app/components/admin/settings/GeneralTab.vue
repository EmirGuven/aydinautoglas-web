<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('general', {
  companyName: '',
  activeSectorTemplate: 'autoglass',
})
const { value: logoValue, load: loadLogo, save: saveLogo } = useSetting('logo', {
  logoMediaId: undefined as string | undefined,
  faviconMediaId: undefined as string | undefined,
})

onMounted(() => {
  load()
  loadLogo()
})

async function onSave() {
  try {
    await save()
    await saveLogo()
    toast.success(t('common.saved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.saveFailed')))
  }
}
</script>

<template>
  <form v-if="!loading" class="flex max-w-lg flex-col gap-4" @submit.prevent="onSave">
    <AdminFormField :label="t('settings.general.companyName')">
      <input
        v-model="value.companyName"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.general.activeSectorTemplate')" :hint="t('settings.general.activeSectorTemplateHint')">
      <div class="flex items-center gap-3">
        <span class="min-h-11 content-center rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {{ value.activeSectorTemplate }}
        </span>
        <NuxtLink to="/admin/appearance/templates" class="text-sm text-primary underline">{{ t('settings.general.changeTemplate') }}</NuxtLink>
      </div>
    </AdminFormField>
    <AdminFormField :label="t('settings.general.logo')">
      <AdminMediaPicker v-model="logoValue.logoMediaId" />
    </AdminFormField>
    <AdminFormField :label="t('settings.general.favicon')">
      <AdminMediaPicker v-model="logoValue.faviconMediaId" />
    </AdminFormField>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
