<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface TranslationRow {
  key: string
  values: Record<string, string>
  group: string
}
interface LanguageRow {
  code: string
  nativeName: string
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows, refresh } = await useFetch<TranslationRow[]>('/api/admin/translations')
const { data: languages } = await useFetch<LanguageRow[]>('/api/languages')

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value ?? []
  return (rows.value ?? []).filter(
    (row) => row.key.toLowerCase().includes(q) || Object.values(row.values).some((v) => v.toLowerCase().includes(q)),
  )
})

const isFormOpen = ref(false)
const editingKey = ref<string | null>(null)
const deleteTarget = ref<TranslationRow | null>(null)
const form = reactive({ key: '', group: 'general', values: {} as Record<string, string> })

function openCreate() {
  editingKey.value = null
  Object.assign(form, { key: '', group: 'general', values: {} })
  isFormOpen.value = true
}

function openEdit(row: TranslationRow) {
  editingKey.value = row.key
  Object.assign(form, { key: row.key, group: row.group, values: { ...row.values } })
  isFormOpen.value = true
}

async function submitForm() {
  try {
    await $fetch(`/api/admin/translations/${encodeURIComponent(form.key)}`, {
      method: 'PUT',
      body: { key: form.key, group: form.group, values: form.values },
    })
    toast.success(t('translations.translationSaved'))
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('translations.translationSaveFailed')))
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/translations/${encodeURIComponent(deleteTarget.value.key)}`, { method: 'DELETE' })
    toast.success(t('translations.translationDeleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('translations.translationDeleteFailed')))
    deleteTarget.value = null
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('translations.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ t('translations.intro1') }}
          <code v-pre>i18n/locales/*.json</code> {{ t('translations.intro2') }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="search"
          :placeholder="t('translations.searchPlaceholder')"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
        <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreate">
          {{ t('translations.newKey') }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2">{{ t('translations.key') }}</th>
            <th v-for="lang in languages" :key="lang.code" class="px-3 py-2">{{ lang.nativeName }}</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.key" class="border-t border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <td class="px-3 py-2 font-mono text-xs">{{ row.key }}</td>
            <td v-for="lang in languages" :key="lang.code" class="max-w-64 truncate px-3 py-2">
              <span v-if="row.values[lang.code]">{{ row.values[lang.code] }}</span>
              <span v-else class="text-xs italic text-slate-400">{{ t('translations.fallsBackToDefault') }}</span>
            </td>
            <td class="px-3 py-2">
              <div class="flex gap-3 text-xs">
                <button type="button" class="text-primary underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
                <button type="button" class="text-red-600 underline" @click="deleteTarget = row">{{ t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="px-4 py-6 text-center text-sm text-slate-400">
        {{ t('translations.noOverridesYet') }}
      </p>
    </div>

    <AdminModal :open="isFormOpen" :title="editingKey ? t('translations.editTranslation') : t('translations.newTranslation')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('translations.key')" :hint="t('translations.keyHint')">
          <input
            v-model="form.key"
            required
            :disabled="!!editingKey"
            placeholder="contactForm.send"
            class="min-h-11 rounded-md border border-slate-300 px-3 font-mono text-sm text-slate-900 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('translations.group')" :hint="t('translations.groupHint')">
          <input v-model="form.group" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField v-for="lang in languages" :key="lang.code" :label="lang.nativeName" :hint="!form.values[lang.code] ? t('translations.leaveBlankForDefault') : undefined">
          <input
            v-model="form.values[lang.code]"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteTarget"
      :title="t('translations.deleteOverrideTitle')"
      :message="t('translations.confirmDeleteOverride', { key: deleteTarget?.key ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
