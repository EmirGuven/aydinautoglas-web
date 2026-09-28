<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface Template {
  key: string
  name: string
  description: string
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: templates } = await useFetch<Template[]>('/api/admin/templates')
const { data: settings } = await useFetch<{ general: { activeSectorTemplate: string } | null }>('/api/settings/public')

const confirmTarget = ref<Template | null>(null)
const applying = ref(false)

async function confirmApply() {
  if (!confirmTarget.value) return
  applying.value = true
  try {
    await $fetch('/api/admin/templates/apply', { method: 'POST', body: { template: confirmTarget.value.key } })
    toast.success(t('appearance.templates.templateApplied', { name: confirmTarget.value.name }))
    confirmTarget.value = null
    await navigateTo('/admin')
  } catch (error) {
    toast.error(getErrorMessage(error, t('appearance.templates.templateApplyFailed')))
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <NuxtLink to="/admin/appearance/theme" class="min-h-11 border-b-2 border-transparent px-3 pb-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">{{ t('appearance.themeTab') }}</NuxtLink>
      <NuxtLink to="/admin/appearance/templates" class="min-h-11 border-b-2 border-indigo-600 px-3 pb-2 text-sm font-medium text-indigo-600">{{ t('appearance.templatesTab') }}</NuxtLink>
    </div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('appearance.templates.title') }}</h1>
    <p class="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
      {{ t('appearance.templates.intro') }}
    </p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="template in templates"
        :key="template.key"
        class="flex flex-col justify-between rounded-xl border border-slate-200 p-5 dark:border-slate-700"
      >
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ template.name }}</h2>
            <span
              v-if="settings?.general?.activeSectorTemplate === template.key"
              class="rounded-full bg-indigo-600/10 px-2 py-0.5 text-xs font-medium text-indigo-600"
            >
              {{ t('appearance.templates.active') }}
            </span>
          </div>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ template.description }}</p>
        </div>
        <button
          type="button"
          class="mt-4 min-h-11 w-fit rounded-md border border-indigo-600 px-4 text-sm font-medium text-indigo-600 hover:bg-indigo-600/5 disabled:opacity-60"
          :disabled="settings?.general?.activeSectorTemplate === template.key"
          @click="confirmTarget = template"
        >
          {{ t('appearance.templates.applyTemplate') }}
        </button>
      </div>
    </div>

    <AdminConfirmDialog
      :open="!!confirmTarget"
      :title="t('appearance.templates.applyTitle')"
      :message="t('appearance.templates.confirmApply', { name: confirmTarget?.name ?? '' })"
      :confirm-label="applying ? t('appearance.templates.applying') : t('appearance.templates.apply')"
      danger
      @confirm="confirmApply"
      @cancel="confirmTarget = null"
    />
  </div>
</template>
