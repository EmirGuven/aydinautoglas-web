<script setup lang="ts">
interface LanguageRow {
  code: string
  name: string
  nativeName: string
  flagEmoji: string
  direction: 'ltr' | 'rtl'
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}

const toast = useToast()
const { t } = useAdminI18n()
const languages = ref<LanguageRow[]>([])
const loading = ref(true)
const isCreateOpen = ref(false)
const formError = ref('')
const submitting = ref(false)

const form = reactive({
  code: '',
  name: '',
  nativeName: '',
  flagEmoji: '',
  direction: 'ltr' as 'ltr' | 'rtl',
  isDefault: false,
  isActive: true,
  sortOrder: 0,
})

async function load() {
  loading.value = true
  try {
    languages.value = await $fetch<LanguageRow[]>('/api/admin/languages')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openCreate() {
  Object.assign(form, {
    code: '',
    name: '',
    nativeName: '',
    flagEmoji: '',
    direction: 'ltr',
    isDefault: false,
    isActive: true,
    sortOrder: languages.value.length,
  })
  formError.value = ''
  isCreateOpen.value = true
}

async function submitCreate() {
  formError.value = ''
  submitting.value = true
  try {
    await $fetch('/api/admin/languages', { method: 'POST', body: form })
    toast.success(t('settings.languages.languageAdded'))
    isCreateOpen.value = false
    await load()
  } catch (error) {
    formError.value = getErrorMessage(error, t('settings.languages.addLanguageFailed'))
  } finally {
    submitting.value = false
  }
}

async function toggleActive(lang: LanguageRow) {
  try {
    await $fetch(`/api/admin/languages/${lang.code}`, { method: 'PATCH', body: { isActive: !lang.isActive } })
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, t('settings.languages.updateLanguageFailed')))
  }
}

async function makeDefault(lang: LanguageRow) {
  try {
    await $fetch(`/api/admin/languages/${lang.code}`, { method: 'PATCH', body: { isDefault: true } })
    toast.success(t('settings.languages.nowDefault', { name: lang.name }))
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, t('settings.languages.updateLanguageFailed')))
  }
}

async function remove(lang: LanguageRow) {
  try {
    await $fetch(`/api/admin/languages/${lang.code}`, { method: 'DELETE' })
    toast.success(t('settings.languages.languageRemoved'))
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, t('settings.languages.removeLanguageFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ t('settings.languages.intro') }}
      </p>
      <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('settings.languages.addLanguage') }}
      </button>
    </div>

    <div v-if="!loading" class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2">{{ t('settings.languages.code') }}</th>
            <th class="px-3 py-2">{{ t('common.name') }}</th>
            <th class="px-3 py-2">{{ t('settings.languages.default') }}</th>
            <th class="px-3 py-2">{{ t('settings.languages.active') }}</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="lang in languages" :key="lang.code" class="border-t border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <td class="px-3 py-2">{{ lang.flagEmoji }} {{ lang.code }}</td>
            <td class="px-3 py-2">{{ lang.nativeName }}</td>
            <td class="px-3 py-2">
              <span v-if="lang.isDefault" class="text-xs font-medium text-indigo-600">{{ t('settings.languages.default') }}</span>
              <button v-else type="button" class="text-xs text-indigo-600 underline" @click="makeDefault(lang)">{{ t('settings.languages.makeDefault') }}</button>
            </td>
            <td class="px-3 py-2">
              <button type="button" class="text-xs underline" @click="toggleActive(lang)">
                {{ lang.isActive ? t('common.yes') : t('common.no') }}
              </button>
            </td>
            <td class="px-3 py-2">
              <button v-if="!lang.isDefault" type="button" class="text-xs text-red-600 underline" @click="remove(lang)">
                {{ t('common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal :open="isCreateOpen" :title="t('settings.languages.addLanguage')" @close="isCreateOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitCreate">
        <AdminFormField :label="t('settings.languages.code')" :hint="t('settings.languages.codeHint')">
          <input
            v-model="form.code"
            required
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('settings.languages.englishName')">
          <input
            v-model="form.name"
            required
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('settings.languages.nativeName')">
          <input
            v-model="form.nativeName"
            required
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('settings.languages.flagEmoji')">
          <input
            v-model="form.flagEmoji"
            required
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('settings.languages.direction')">
          <select
            v-model="form.direction"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="ltr">{{ t('settings.languages.ltr') }}</option>
            <option value="rtl">{{ t('settings.languages.rtl') }}</option>
          </select>
        </AdminFormField>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60" :disabled="submitting">
          {{ submitting ? t('settings.languages.adding') : t('settings.languages.addLanguage') }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
