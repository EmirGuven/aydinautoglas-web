<script setup lang="ts">
const TEMPLATE_KEYS = [
  'appointmentAdminNotification',
  'appointmentCustomerConfirmation',
  'contactAdminNotification',
  'contactCustomerConfirmation',
] as const

const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('emailTemplates', {
  appointmentAdminNotification: { subject: {} as Record<string, string>, body: {} as Record<string, string> },
  appointmentCustomerConfirmation: { subject: {} as Record<string, string>, body: {} as Record<string, string> },
  contactAdminNotification: { subject: {} as Record<string, string>, body: {} as Record<string, string> },
  contactCustomerConfirmation: { subject: {} as Record<string, string>, body: {} as Record<string, string> },
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
  <form v-if="!loading" class="flex max-w-2xl flex-col gap-6" @submit.prevent="onSave">
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ t('settings.emailTemplates.intro') }}
    </p>
    <div v-for="template in TEMPLATE_KEYS" :key="template" class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 class="mb-3 font-medium text-slate-900 dark:text-slate-100">{{ t(`settings.emailTemplates.${template}`) }}</h3>
      <AdminFormField :label="t('settings.emailTemplates.subjectDe')">
        <input
          v-model="value[template].subject.de"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
      </AdminFormField>
      <AdminFormField :label="t('settings.emailTemplates.bodyDe')">
        <textarea
          v-model="value[template].body.de"
          rows="3"
          class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </AdminFormField>
    </div>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
