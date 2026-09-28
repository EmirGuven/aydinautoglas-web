<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('contact', {
  email: '',
  phone: '',
  whatsapp: '',
  address: {} as Record<string, string>,
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
    <AdminFormField :label="t('common.email')">
      <input
        v-model="value.email"
        type="email"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.contact.phone')">
      <input
        v-model="value.phone"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.contact.whatsapp')">
      <input
        v-model="value.whatsapp"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <AdminFormField :label="t('settings.contact.addressDe')" :hint="t('settings.contact.addressHint')">
      <input
        v-model="value.address.de"
        class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </AdminFormField>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
