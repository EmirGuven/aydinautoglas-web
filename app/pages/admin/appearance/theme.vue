<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface ThemeForm {
  colorPrimary: string
  colorSecondary: string
  colorAccent: string
  colorBackground: string
  colorText: string
  fontFamily: string
  borderRadius: string
  buttonStyle: 'solid' | 'outline' | 'pill'
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: initialTheme } = await useFetch<ThemeForm>('/api/admin/theme')

const form = reactive<ThemeForm>({
  colorPrimary: initialTheme.value?.colorPrimary ?? '#1d4ed8',
  colorSecondary: initialTheme.value?.colorSecondary ?? '#0f172a',
  colorAccent: initialTheme.value?.colorAccent ?? '#f59e0b',
  colorBackground: initialTheme.value?.colorBackground ?? '#ffffff',
  colorText: initialTheme.value?.colorText ?? '#0f172a',
  fontFamily: initialTheme.value?.fontFamily ?? 'system-ui, sans-serif',
  borderRadius: initialTheme.value?.borderRadius ?? '0.5rem',
  buttonStyle: initialTheme.value?.buttonStyle ?? 'solid',
})

const isDirty = ref(false)
watch(form, () => {
  isDirty.value = true
}, { deep: true })
useUnsavedChanges(isDirty)

const previewStyle = computed(() => ({
  '--preview-primary': form.colorPrimary,
  '--preview-secondary': form.colorSecondary,
  '--preview-accent': form.colorAccent,
  '--preview-background': form.colorBackground,
  '--preview-text': form.colorText,
  '--preview-font': form.fontFamily,
  '--preview-radius': form.borderRadius,
}))

const previewButtonClass = computed(() => {
  if (form.buttonStyle === 'outline') return 'border-2 bg-transparent'
  if (form.buttonStyle === 'pill') return 'rounded-full text-white'
  return 'text-white'
})

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/theme', { method: 'PUT', body: form })
    isDirty.value = false
    toast.success(t('appearance.theme.themeSaved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('appearance.theme.themeSaveFailed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <NuxtLink to="/admin/appearance/theme" class="min-h-11 border-b-2 border-primary px-3 pb-2 text-sm font-medium text-primary">{{ t('appearance.themeTab') }}</NuxtLink>
      <NuxtLink to="/admin/appearance/templates" class="min-h-11 border-b-2 border-transparent px-3 pb-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">{{ t('appearance.templatesTab') }}</NuxtLink>
    </div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('appearance.theme.title') }}</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {{ t('appearance.theme.intro') }}
    </p>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800" @submit.prevent="save">
        <AdminFormField :label="t('appearance.theme.primaryColor')">
          <input v-model="form.colorPrimary" type="color" class="h-11 w-20 rounded-md border border-slate-300 dark:border-slate-600">
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.secondaryColor')">
          <input v-model="form.colorSecondary" type="color" class="h-11 w-20 rounded-md border border-slate-300 dark:border-slate-600">
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.accentColor')">
          <input v-model="form.colorAccent" type="color" class="h-11 w-20 rounded-md border border-slate-300 dark:border-slate-600">
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.backgroundColor')">
          <input v-model="form.colorBackground" type="color" class="h-11 w-20 rounded-md border border-slate-300 dark:border-slate-600">
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.textColor')">
          <input v-model="form.colorText" type="color" class="h-11 w-20 rounded-md border border-slate-300 dark:border-slate-600">
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.fontFamily')">
          <input
            v-model="form.fontFamily"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.borderRadius')">
          <input
            v-model="form.borderRadius"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('appearance.theme.buttonStyle')">
          <select
            v-model="form.buttonStyle"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="solid">{{ t('appearance.theme.solid') }}</option>
            <option value="outline">{{ t('appearance.theme.outline') }}</option>
            <option value="pill">{{ t('appearance.theme.pill') }}</option>
          </select>
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
          {{ saving ? t('common.saving') : t('appearance.theme.saveTheme') }}
        </button>
      </form>

      <div
        class="rounded-xl border border-slate-200 p-6 dark:border-slate-700"
        :style="[previewStyle, { background: 'var(--preview-background)', color: 'var(--preview-text)', fontFamily: 'var(--preview-font)' }]"
      >
        <p class="mb-1 text-xs uppercase tracking-wide opacity-60">{{ t('appearance.theme.livePreview') }}</p>
        <h2 class="text-xl font-bold">{{ t('appearance.theme.previewHeading') }}</h2>
        <p class="mt-2 text-sm opacity-80">
          {{ t('appearance.theme.previewBody') }}
        </p>
        <div class="mt-4 flex gap-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium"
            :class="previewButtonClass"
            :style="{
              backgroundColor: form.buttonStyle === 'outline' ? 'transparent' : 'var(--preview-primary)',
              borderColor: 'var(--preview-primary)',
              color: form.buttonStyle === 'outline' ? 'var(--preview-primary)' : undefined,
              borderRadius: 'var(--preview-radius)',
            }"
          >
            {{ t('appearance.theme.previewButton') }}
          </button>
          <span
            class="inline-flex items-center px-3 py-1 text-xs font-medium text-white"
            :style="{ backgroundColor: 'var(--preview-accent)', borderRadius: 'var(--preview-radius)' }"
          >
            {{ t('appearance.theme.previewBadge') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
