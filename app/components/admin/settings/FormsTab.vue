<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('forms', {
  honeypotEnabled: true,
  turnstileEnabledOnForms: false,
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
      {{ t('settings.forms.honeypotNote') }}
    </p>
    <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input v-model="value.turnstileEnabledOnForms" type="checkbox">
      {{ t('settings.forms.turnstileLabel') }}
    </label>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
